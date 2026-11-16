// The words of an audio guide: the AI turns the place's Wikipedia article into 2 to 5 short steps, each said where
// the visitor stands, ending with where to go next. Facts only from the article (CLAUDE.md, Written copy).
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
Write the audio guide of "${place}"${town ? ` in ${town}` : ""} in ${LANGUAGES[lang]}, from the Wikipedia article below.

Shape:
- ${AUDIO_GUIDE.minSteps} to ${AUDIO_GUIDE.maxSteps} steps, in the order a visitor goes round: outside first, then inside, then the details.
- Each step: ${AUDIO_GUIDE.minWords} to ${AUDIO_GUIDE.maxWords} words, said aloud by a voice. Short sentences. Talk to the listener ("mira", "fíjate", "look up").
- The length follows what the article has to tell. A monument with a long, rich history: 3 to ${AUDIO_GUIDE.maxSteps} steps of
  120 to ${AUDIO_GUIDE.maxWords} words (3 to 5 minutes in all). A small place with a short article: ${AUDIO_GUIDE.minSteps} steps near
  ${AUDIO_GUIDE.minWords} words. Never pad: a shorter guide is better than one with filler or a fact the article does not give.
- Each step starts by telling the listener what to look at, then the story behind it.
- Every step but the last ends by saying where to go next, as concretely as the article allows ("Entra y sube a la primera planta").
  If the article does not say how the place is laid out, keep the direction general ("Entra", "Rodea el edificio") rather than inventing a door or a side.
- The last step ends on its strongest fact or one practical tip. No farewell, no summary.
- Never mention the app, buttons, pressing play, "the next step" or "this audio guide".

Facts:
- Every fact, date, name and number must come from the article. If it is not in the article, it is not in the guide.
- Every fact must be about "${place}" itself, not about a nearby place the article mentions in passing.
- Pick the most striking stories (one or two per step); leave out lists of dates and architects' full names unless they matter.

Style (it must sound like a person, not a brochure):
- Concrete over general: "tardaron diez años" beats "su construcción fue larga".
- No brochure phrases: no "sumérgete", "el corazón de", "joya", "no te lo puedes perder", "imprescindible", "fascinante", "majestuoso", "testigo de la historia".
- No formulaic closers ("merece la pena", "una visita obligada").
- Vary the steps: not every step opens or closes the same way.
- Write numbers and dates the way a person says them.

"action" is what the listener taps once they reach the next spot, in first person and in the guide's language ("Ya estoy dentro", "Ya estoy arriba", "I'm inside").
"autoNext" is true only when the next step is heard from exactly the same spot.

Article:
`;

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
export const writeScript = async ({ lang, place, town, article }) => {
  const { data, usage, model, provider } = await generateJsonWithFallback({
    instructions: instructionsFor({ lang, place, town }) + article,
    prompt: "Write the audio guide now.",
    schema: SCHEMA,
  });
  const steps = cleanSteps(data?.steps);
  if (!steps) throw new AppError("audioUnavailable");
  return { steps, usage, model, provider };
};
