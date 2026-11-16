// Audio guides of historic places (docs/audio-guide.md): found if someone already asked for this place, else
// made now — the article from Wikipedia (or, for a place without one, notes from a web search), the steps from the AI,
// each step read aloud by Google — and kept.
import { AppError } from "@/server/errors";
import { articleText, companionArticle } from "@/server/audioGuide/article";
import { researchPlace } from "@/server/audioGuide/research";
import { writeScript } from "@/server/audioGuide/script";
import { hasSpeech, speak, voiceFor } from "@/server/audioGuide/speech";
import { findGuide, guideId, saveAudio, saveGuide } from "@/server/audioGuide/store";
import { AUDIO_GUIDE } from "@/constants/audioGuide";

// Guides being made in this server instance: a second request for the same one waits for the first
const making = new Map();

const estimatedSeconds = (text) => Math.round(text.split(/\s+/).length / AUDIO_GUIDE.wordsPerSecond);

// The article and, when there is one, the same place's article in the other language: more to tell, same model
const sourcesFor = async (article) => {
  const [main, companion] = await Promise.all([articleText(article), companionArticle(article)]);
  if (!main) return null;
  const second = companion ? await articleText(companion) : null;
  return { title: main.title, texts: [main.text, second?.text].filter(Boolean) };
};

// The web search runs beside the articles: with an article it brings curiosities, legends and the visit; for a place
// without one (`placeWithoutArticle`) it brings everything, and when it finds nothing the AI tells what it knows
const makeGuide = async ({ id, lang, article, place, userId, town }) => {
  const withoutArticle = Boolean(article.knowledgeOnly);
  const searched = article.place ?? { name: place || article.title, town };
  const [wiki, research] = await Promise.all([
    withoutArticle ? null : sourcesFor(article),
    researchPlace({ ...searched, hasArticle: !withoutArticle }),
  ]);
  const title = place || wiki?.title;
  if ((!withoutArticle && !wiki) || !title) throw new AppError("audioBadPlace", {}, 404);
  const { steps, usage, model, provider } = await writeScript({
    lang,
    place: title,
    town,
    articles: wiki?.texts ?? [],
    notes: research?.notes ?? null,
  });
  // The steps are read aloud side by side (a few seconds each)
  const audio = await Promise.all(steps.map(async (step, index) => saveAudio(id, index, await speak(step.text, lang))));
  return saveGuide({
    id,
    lang,
    article_url: article.url,
    title,
    steps: steps.map((step, index) => ({ ...step, audio: audio[index], seconds: estimatedSeconds(step.text) })),
    provider,
    model,
    voice: voiceFor(lang),
    // The web search's cost is kept beside the script's (`research`): a guide that used the web says so to the listener
    usage: research ? { ...usage, research: research.usage } : (usage ?? null),
    characters: steps.reduce((total, step) => total + step.text.length, 0),
    created_by: userId,
  });
};

// The guide, made now if needed. `canMake`: checked only when it has to be made (signing in, the daily limit).
export const getAudioGuide = async ({ article, lang, place, town, userId, canMake }) => {
  const id = guideId(article.url, lang);
  const found = await findGuide(id);
  if (found) return found;
  if (!hasSpeech()) throw new AppError("audioUnavailable");
  await canMake();
  if (!making.has(id)) {
    making.set(
      id,
      makeGuide({ id, lang, article, place, town, userId }).finally(() => making.delete(id))
    );
  }
  return making.get(id);
};
