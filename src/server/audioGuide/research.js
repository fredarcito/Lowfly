// A web search before every new guide, the way ChatGPT or Gemini answer about a place (docs/audio-guide.md):
// - a place with a Wikipedia article: the search looks for what the article rarely tells — the curiosities, legends and
//   anecdotes guides tell, and how the visit goes (where the entrance is, what is inside);
// - a place without one (a small church, a viewpoint): the search brings everything, and its notes play the article.
// Some 2–3 US cents a guide (US$0.01 a search plus the pages read), once: the guide is kept.
import { hasClaude, researchWithSearch } from "@/server/claude";

// Notes shorter than this mean the searches found nothing worth telling
const MIN_NOTE_WORDS = 120;

const SHARED = `Only what the sources say: if they do not say it, leave it out. Every note must be about this place, not a nearby
one with a similar name. Leave out opening hours, prices and tickets. Plain notes in English, no introduction, no offer
to do more, no list of sources at the end.`;

const INSTRUCTIONS = {
  // The article already has the history: the search adds what makes a guide memorable and walkable
  complement: `You research a place for a travel audio guide. Its Wikipedia article already gives the history, so search
the web (local tourism sites, the place's own site, travel guides and blogs, in English and in the local language) for
what encyclopedias leave out, and write notes about:
- curiosities, anecdotes, legends and traditions guides and locals tell (saying which are legends);
- rituals visitors do there and small details to spot (rubbing a statue's toe for luck, so it shines; a coin in a
  fountain; a bullet mark; a hidden symbol), with where they are;
- how the visit goes: where the entrance is, the route inside, what is in each part, details visitors notice, the view.
${SHARED}`,
  // No article: the notes are the guide's only source
  replace: `You research a place for a travel audio guide. Search the web (local tourism sites, the place's own site, travel
guides, articles; in English and in the local language), then write notes about:
- its history, the people behind it, dates;
- legends, traditions and curiosities (saying which are legends);
- rituals visitors do there and small details to spot (rubbing a statue for luck, a coin in a fountain, a hidden
  symbol), with where they are;
- how the visit goes and what the visitor sees (buildings, entrance, what is inside, the view), as the sources describe it.
${SHARED}`,
};

const words = (text) => text.trim().split(/\s+/).filter(Boolean).length;

// `hasArticle`: search only for what the article lacks. → { notes, usage } or null when it could not search or found
// too little (the guide is then made without it)
export const researchPlace = async ({ name, mapName, town, hasArticle }) => {
  if (!hasClaude() || !name) return null;
  const otherName = mapName && mapName !== name ? ` (also known as "${mapName}")` : "";
  try {
    const { text, usage, searches } = await researchWithSearch({
      instructions: INSTRUCTIONS[hasArticle ? "complement" : "replace"],
      prompt: `"${name}"${otherName}${town ? ` in ${town}` : ""}.`,
    });
    if (searches === 0 || words(text) < MIN_NOTE_WORDS) return null;
    return { notes: text, usage };
  } catch (error) {
    console.error("Audio guide research failed", error?.code ?? error);
    return null;
  }
};
