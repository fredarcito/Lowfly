// The Wikipedia article a stop's history came from: the only source the audio guide may tell facts from.
import { USER_AGENT as UA } from "@/constants/site";
import { AppError, badRequest } from "@/server/errors";
import { searchPlace } from "@/server/wikipedia";
import { km } from "@/utils/itinerary";

const MONTH = 30 * 86400;
// An article found by name is about the stop only if its coordinates are this close (as for the itinerary's history)
const SAME_PLACE_KM = 2;
const WIKI_LANGS = ["es", "en"];
// Enough of the article for 2 to 5 steps, without paying for the whole of a very long one
const MAX_CHARS = 14_000;
// Sections that hold no facts to tell (notes, references, links…), in the languages we read
const END_SECTIONS = /^==\s*(Referencias|Notas|Bibliografía|Enlaces externos|Véase también|References|Notes|Bibliography|External links|See also|Further reading)\s*==\s*$/m;

// { lang, title, url } of a Wikipedia article link, or a 400 for anything else
export const readArticleUrl = (value) => {
  let url;
  try {
    url = new URL(String(value));
  } catch {
    throw badRequest("audioBadPlace");
  }
  const host = url.hostname.match(/^([a-z]{2,3})(?:\.m)?\.wikipedia\.org$/);
  if (url.protocol !== "https:" || !host || !url.pathname.startsWith("/wiki/")) throw badRequest("audioBadPlace");
  const title = decodeURIComponent(url.pathname.slice("/wiki/".length)).replace(/_/g, " ").trim();
  if (!title || title.includes(":")) throw badRequest("audioBadPlace");
  return { lang: host[1], title, url: `https://${host[1]}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}` };
};

const isCoordinate = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

// A stop without history (no article was found when the itinerary was made, as with places the traveller asked
// for): its article searched by name and town, in the page's language and then the other one, kept only when it
// is about that same spot. `mapName`: the place's name on the map (often local or English), tried after the stop's
// own name. → { lang, title, url }, or a 404 when the place has none.
export const findArticle = async ({ name, mapName, town, lat, lng, lang }) => {
  if (!name || !isCoordinate(lat, lng)) throw badRequest("audioBadPlace");
  const names = [...new Set([name, mapName].filter(Boolean))];
  for (const wikiLang of [lang, ...WIKI_LANGS.filter((other) => other !== lang)]) {
    for (const searched of names) {
      const fact = await searchPlace(town ? `${searched} ${town}` : searched, wikiLang);
      if (fact?.url && isCoordinate(fact.lat, fact.lng) && km({ lat, lng }, { lat: fact.lat, lng: fact.lng }) <= SAME_PLACE_KM) {
        return readArticleUrl(fact.url);
      }
    }
  }
  throw new AppError("audioBadPlace", {}, 404);
};

// The article's plain text (intro and sections, without references), or null
export const articleText = async ({ lang, title }) => {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    redirects: "1",
    prop: "extracts",
    explaintext: "1",
    exsectionformat: "wiki",
    titles: title,
  });
  const response = await fetch(`https://${lang}.wikipedia.org/w/api.php?${params}`, {
    headers: { "user-agent": UA },
    next: { revalidate: MONTH },
  });
  if (!response.ok) return null;
  const page = (await response.json()).query?.pages?.[0];
  if (!page?.extract || page.missing) return null;
  const text = page.extract.split(END_SECTIONS)[0].replace(/\n{3,}/g, "\n\n").trim();
  return { title: page.title, text: text.slice(0, MAX_CHARS) };
};
