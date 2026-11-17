// The words of an audio guide: the AI turns the place's Wikipedia articles (its language and, when there is one, the
// other) and notes from a web search (curiosities, legends, the visit) into 3 to 12 steps, each said where the visitor stands, ending with where to go next. A story with emotion,
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

// How every guide sounds, and what its buttons mean
const STYLE = `
Style (it must sound like a person, not a brochure):
- Kind and warm, like a guide who enjoys sharing the place. Never mock, judge or scold the listener or other visitors:
  no "la gente no mira", "todos entran con la cabeza agachada", "casi nadie se da cuenta", no jokes at anyone's expense.
- Invite rather than order: "si te detienes a observar…", "vale la pena alzar la vista", "con calma, fíjate en…"
  sound better than a string of bare commands ("Mira arriba. Ahora mira a la izquierda.").
- Concrete over general: "tardaron diez años" beats "su construcción fue larga".
- No brochure phrases: no "sumérgete", "el corazón de", "joya", "no te lo puedes perder", "imprescindible", "fascinante", "majestuoso", "testigo de la historia".
- No formulaic closers ("merece la pena", "una visita obligada").
- Vary the steps: not every step opens or closes the same way.
- Write numbers and dates the way a person says them.
- Never say opening hours, prices, tickets or anything else that changes: the audio is recorded once and kept for years.

"action" is what the listener taps once they reach the next spot, in first person and in the guide's language ("Ya estoy dentro", "Ya estoy arriba", "I'm inside").
"autoNext" is true only when the next step is heard from exactly the same spot.
`;

// What the guide is written from: Wikipedia articles, notes from a web search, or both
const SOURCES = {
  both: `the sources below: Wikipedia articles (the same place, in one or two languages) and notes from web pages.
Trust the articles for dates, names and numbers; the notes bring the curiosities, legends and how the visit goes
(where the entrance is, what is inside). If they disagree on a fact, follow the articles`,
  articles: "the Wikipedia articles below (the same place, in one or two languages; use both)",
  notes: "the notes below, gathered from web pages about this place",
};

const instructionsFor = ({ lang, place, town, sources }) => `You write audio guides for travellers standing in front of a place.
Write the audio guide of "${place}"${town ? ` in ${town}` : ""} in ${LANGUAGES[lang]}, from ${SOURCES[sources]}.
Say everything in ${LANGUAGES[lang]}, whatever language the sources are in. Below, "the articles" means these sources.

What matters most is the experience. You are the best local guide in town telling a story, not an encyclopedia or a
newspaper: the listener should feel curiosity, surprise, sometimes a smile or a chill. People, ambition, rivalry,
disasters, scandals, love, death and the odd detail nobody expects are what they will remember and tell at dinner.

Shape:
- In the order a visitor goes round: outside first, then inside, then the details. Short sentences, said aloud by a
  voice. Talk to the listener ("mira", "fíjate", "look up").
- Length: a real audio guide, not a teaser, and as long as there is good material, not as long as the kind of place.
  First gather the good material: what the sources give plus what you know about this place, its people and its era.
  Good material is above all what an encyclopedia leaves out: curiosities, anecdotes, legends, rumours of the time,
  rituals, odd details, what daily life was like there, the gossip guides love to tell. Use all of it, generously.
  One step per strong story or spot to look at, each of 150 to ${AUDIO_GUIDE.maxWords} words; take your time with each.
  Little to tell: 4 or 5 steps (some 5 minutes). A lot: up to ${AUDIO_GUIDE.maxSteps} steps (some 15 minutes).
  Filler is only what adds nothing: a story told twice, vague praise, generalities that fit any place. Never use it to
  reach a length: a tight 8 minutes beats a padded 15.
- Museums: their pieces move between rooms and they have their own audio guide, so tell the museum as a story, not a
  room-by-room walk. The first steps: how the museum and its collection came to be, and the civilisation or era it
  shows. Then one step per star piece (the ones the sources single out), with the story of how it was made, found or
  saved. Never say room or case numbers, floors or "a tu izquierda": name the piece so the listener can find it
  ("busca el papiro de Derveni"); "where" names the piece, not the room ("Ante el papiro de Derveni"). The last step may
  suggest the museum's own audio guide to see the rest piece by piece.
- The first step opens with a short introduction (30 to 50 words) before anything else: where the listener is, what
  this place is in one or two strokes, and a hook for what is coming ("aquí rezaron cristianos, musulmanes y otra vez
  cristianos; y un emperador que nunca llegó a usarla"). No "Bienvenido a", no "En esta guía", no list of what is coming.
  Only then the first thing to look at.
- After that, each step starts by telling the listener what to look at, then the story behind it.
- Every step has at least one curious fact or anecdote: something surprising, human or strange ("¿Sabías que…?" once at
  most in the whole guide; vary how you bring them in). Build to it; don't open with it.
- When the sources give one, include a moment the listener acts or looks for something: a ritual ("frota el dedo
  gordo del pie de Aristóteles: dicen que trae suerte en los exámenes; fíjate en lo que brilla") or a detail to spot.
  These are what people remember most. Only where the sources say they are.
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
${STYLE}`;

// A place with no Wikipedia article (a small church, a viewpoint) that the web search found nothing about: a guide told from the AI's own knowledge,
// about what surrounds the building (its saint or name, the neighbourhood, the city's story), never what is inside it
const knowledgeInstructionsFor = ({ lang, place, town }) => `You write audio guides for travellers standing in front of a place.
Write the audio guide of "${place}"${town ? ` in ${town}` : ""} in ${LANGUAGES[lang]}. There is no article about this place:
tell it from what you know.

What matters most is the experience. You are the best local guide in town telling a story, not an encyclopedia: the
listener should feel curiosity, surprise, sometimes a smile. People, faith, legends and the odd detail are what they remember.

Shape:
- 3 or 4 steps of 150 to 200 words (some 5 minutes in all), said aloud by a voice. Short sentences. Talk to the listener ("mira", "fíjate").
- The first step opens with a short introduction (30 to 50 words) before anything else: where the listener is, what
  this place is in one or two strokes, and a hook for what is coming ("aquí rezaron cristianos, musulmanes y otra vez
  cristianos; y un emperador que nunca llegó a usarla"). No "Bienvenido a", no "En esta guía", no list of what is coming.
  Only then the first thing to look at.
- Every step has a curious fact, an anecdote or a legend. Give it rhythm: a question, a pause before the twist, a contrast.
- Every step but the last ends with a general direction ("Rodea la iglesia", "Acércate a la entrada", "Date la vuelta y mira la ciudad").
- The last step ends on its strongest story or one practical tip. No farewell, no summary.
- Never mention the app, buttons, pressing play, "the next step" or "this audio guide".

What to tell:
- You probably know little about this exact building, so tell what surrounds it: whom or what it is named after and their
  story, the neighbourhood and what it was like, the city's history that explains why a place like this stands here,
  the view, and the legends and traditions people tell (as such: "se cuenta que…", "dicen que…").
- Say only what you really know. If you know nothing reliable about the building itself, do not pretend: talk about
  its name, its setting and its city.
- Never describe what is inside or what the building shows (mosaics, icons, columns, paintings), its exact age, or
  directions like "a tu izquierda": the listener is looking at it and would catch the mistake.
- No exact dates or figures you are not sure of; say "hace siglos", "cientos de".
${STYLE}`;

const sourcesBlock = (articles, notes) =>
  articles.map((article, index) => `\nWikipedia article ${index + 1}:\n${article}\n`).join("") +
  (notes ? `\nNotes from web pages:\n${notes}\n` : "");

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
      text: clean(step?.text, 2500),
    }))
    .filter((step) => step.title && words(step.text) >= AUDIO_GUIDE.minWords / 2)
    .slice(0, AUDIO_GUIDE.maxSteps);
  if (kept.length < AUDIO_GUIDE.minSteps) return null;
  const last = kept.length - 1;
  return kept.map((step, index) => (index === last ? { ...step, action: null, autoNext: false } : step));
};

// → { steps, usage, model, provider }
// `articles`: Wikipedia texts; `notes`: what a web search found (curiosities, legends, the visit). Neither: told from the
// AI's own knowledge.
export const writeScript = async ({ lang, place, town, articles = [], notes = null }) => {
  const sources = articles.length && notes ? "both" : articles.length ? "articles" : notes ? "notes" : null;
  const instructions = sources
    ? instructionsFor({ lang, place, town, sources }) + sourcesBlock(articles, notes)
    : knowledgeInstructionsFor({ lang, place, town });
  const { data, usage, model, provider } = await generateJsonWithFallback({
    instructions,
    prompt: "Write the audio guide now.",
    schema: SCHEMA,
  });
  const steps = cleanSteps(data?.steps);
  if (!steps) throw new AppError("audioUnavailable");
  return { steps, usage, model, provider };
};
