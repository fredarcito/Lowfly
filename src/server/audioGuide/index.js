// Audio guides of historic places (docs/audio-guide.md): found if someone already asked for this place, else
// made now — the article from Wikipedia, the steps from the AI, each step read aloud by Google — and kept.
import { AppError } from "@/server/errors";
import { articleText } from "@/server/audioGuide/article";
import { writeScript } from "@/server/audioGuide/script";
import { hasSpeech, speak, voiceFor } from "@/server/audioGuide/speech";
import { findGuide, guideId, saveAudio, saveGuide } from "@/server/audioGuide/store";
import { AUDIO_GUIDE } from "@/constants/audioGuide";

// Guides being made in this server instance: a second request for the same one waits for the first
const making = new Map();

const estimatedSeconds = (text) => Math.round(text.split(/\s+/).length / AUDIO_GUIDE.wordsPerSecond);

const makeGuide = async ({ id, lang, article, place, userId, town }) => {
  const source = await articleText(article);
  if (!source) throw new AppError("audioBadPlace", {}, 404);
  const title = place || source.title;
  const { steps, usage, model, provider } = await writeScript({ lang, place: title, town, article: source.text });
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
    usage: usage ?? null,
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
