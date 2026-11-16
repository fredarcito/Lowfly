// The words of an audio guide: the AI turns the place's Wikipedia articles (its language and, when there is one, the
// other) into 2 to 5 steps, each said where the visitor stands, ending with where to go next. A story with emotion,
// not an encyclopedia: the AI adds context, curiosities and legends (told as legends); directions, what a wall shows
// and exact figures come only from the articles.
import { AppError } from "@/server/errors";
import { generateJsonWithFallback } from "@/server/ai";
import { AUDIO_GUIDE } from "@/constants/audioGuide";

const LANGUAGES = { es: "Spanish (from Spain, informal tú)", en: "English" };

const SCHEMA = {
  type: "object",
  properties: {
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "2 to 4 words: what this step looks at" },
          where: { type: "string", description: "Up to 6 words: where the visitor stands to hear it" },
          action: { type: ["string", "null"], description: "First-person words for the button once there, e.g. \"Ya estoy dentro\"; null on the last step" },
          autoNext: { type: "boolean", description: "true when the next step is heard from this same spot" },
          text: { type: "string", description: "What the voice says" },
        },
        required: ["title", "where", "action", "autoNext", "text"],
      },
    },
  },
  required: ["steps"],
};

const instructionsFor = ({ lang, place, town }) => `You write audio guides for travellers standing in front of a place.
Write the audio guide of "${place}"${town ? ` in ${town}` : ""} in ${LANGUAGES[lang]}, from the Wikipedia articles below
(the same place, in one or two languages; use both, and say everything in ${LANGUAGES[lang]}).

What matters most is the experience. You are the best local guide in town telling a story, not an encyclopedia or a
newspaper: the listener should feel curiosity, surprise, sometimes a smile or a chill. People, ambition, rivalry,
disasters, scandals, love, death and the odd detail nobody expects are what they will remember and tell at dinner.

Shape:
- ${AUDIO_GUIDE.minSteps} to ${AUDIO_GUIDE.maxSteps} steps, in the order a visitor goes round: outside first, then inside, then the details.
- Each step: ${AUDIO_GUIDE.minWords} to ${AUDIO_GUIDE.maxWords} words, said aloud by a voice. Short sentences. Talk to the listener ("mira", "fíjate", "look up").
- A monument with a long history (most places with articles this size): 4 to ${AUDIO_GUIDE.maxSteps} steps of 130 to ${AUDIO_GUIDE.maxWords} words,
  4 to 6 minutes in all. Only a small place with little to tell gets ${AUDIO_GUIDE.minSteps} or 3 shorter steps.
- Each step starts by telling the listener what to look at, then the story behind it.
- Every step has at least one curious fact or anecdote: something surprising, human or strange ("¿Sabías que…?" once at
  most in the whole guide; vary how you bring them in). Build to it; don't open with it.
- Give it emotion and rhythm: a question to the listener, a pause before the twist, a contrast ("hoy está en silencio;
  hace mil años aquí se gritaba…"), the scene put in front of their eyes ("imagina…" once at most).
- Every step but the last ends by saying where to go next, as concretely as the articles allow ("Entra y sube a la primera planta").
  If the articles do not say how the place is laid out, keep the direction general ("Entra", "Rodea el edificio") rather than inventing a door or a side.
- The last step ends on its strongest story or one practical tip. No farewell, no summary.
- Never mention the app, buttons, pressing play, "the next step", "this audio guide", Wikipedia or "the article".

Facts:
- The articles are the backbone, and you add what you know to make it a story: what the city and its people were
  like then, who ordered it built and why, the gossip of the time, and the curiosities, legends and anecdotes guides tell
  about this place even when nobody can prove them.
- Tell what is uncertain as what it is, and make that part of the charm: "se cuenta que…", "la leyenda dice…",
  "los de aquí juran que…". Never present a legend as a certain fact.
- What the listener will check with their own eyes comes only from the articles: directions and positions ("a tu
  izquierda", "al fondo", "en la tercera columna") and what a wall, mosaic or room shows. Getting these wrong breaks the
  spell. Exact dates and figures also come from the articles; elsewhere say "hace unos mil años", "cientos de".
- Every fact must be about "${place}" itself, not about a nearby place the articles mention in passing.
- Pick the most striking stories (one or two per step); leave out lists of dates and architects' full names unless they matter.

Style (it must sound like a person, not a brochure):
- Concrete over general: "tardaron diez años" beats "su construcción fue larga".
- No brochure phrases: no "sumérgete", "el corazón de", "joya", "no te lo puedes perder", "imprescindible", "fascinante", "majestuoso", "testigo de la historia".
- No formulaic closers ("merece la pena", "una visita obligada").
- Vary the steps: not every step opens or closes the same way.
- Write numbers and dates the way a person says them.

"action" is what the listener taps once they reach the next spot, in first person and in the guide's language ("Ya estoy dentro", "Ya estoy arriba", "I'm inside").
"autoNext" is true only when the next step is heard from exactly the same spot.
`;

const articlesBlock = (articles) => articles.map((text, index) => `\nArticle ${index + 1}:\n${text}\n`).join("");

const words = (text) => text.trim().split(/\s+/).filter(Boolean).length;
const clean = (value, max) => (typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "");

// Steps the AI wrote, checked: a believable number of steps, each with its text; the last never waits for a tap
const cleanSteps = (steps) => {
  if (!Array.isArray(steps)) return null;
  const kept = steps
    .map((step) => ({
      title: clean(step?.title, 60),
      where: clean(step?.where, 80),
      action: clean(step?.action, 40) || null,
      autoNext: step?.autoNext === true,
      text: clean(step?.text, 1500),
    }))
    .filter((step) => step.title && words(step.text) >= AUDIO_GUIDE.minWords / 2)
    .slice(0, AUDIO_GUIDE.maxSteps);
  if (kept.length < AUDIO_GUIDE.minSteps) return null;
  const last = kept.length - 1;
  return kept.map((step, index) => (index === last ? { ...step, action: null, autoNext: false } : step));
};

// → { steps, usage, model, provider }
export const writeScript = async ({ lang, place, town, articles }) => {
  const { data, usage, model, provider } = await generateJsonWithFallback({
    instructions: instructionsFor({ lang, place, town }) + articlesBlock(articles),
    prompt: "Write the audio guide now.",
    schema: SCHEMA,
  });
  const steps = cleanSteps(data?.steps);
  if (!steps) throw new AppError("audioUnavailable");
  return { steps, usage, model, provider };
};
