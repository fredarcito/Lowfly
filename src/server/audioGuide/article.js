// The Wikipedia article a stop's history came from: the only source the audio guide may tell facts from.
import { USER_AGENT as UA } from "@/constants/site";
import { AppError, badRequest } from "@/server/errors";
import { searchPlace } from "@/server/wikipedia";
import { km } from "@/utils/itinerary";

const MONTH = 30 * 86400;
// An article found by name is about the stop only if its coordinates are this close. Tighter than the itinerary's
// 2 km: in an old town 2 km holds a dozen churches (Thessaloniki's St Paul found Hagia Sophia, 1.3 km away).
const SAME_PLACE_KM = 0.5;
// Words that say what a place is, not which one: two churches share them
const GENERIC_WORDS = new Set([
  "iglesia", "church", "catedral", "cathedral", "basilica", "capilla", "chapel", "monasterio", "monastery",
  "convento", "convent", "mezquita", "mosque", "sinagoga", "synagogue", "templo", "temple", "museo", "museum",
  "palacio", "palace", "castillo", "castle", "fortaleza", "fortress", "torre", "tower", "puerta", "gate",
  "plaza", "square", "parque", "park", "puente", "bridge", "mercado", "market", "barrio", "district",
  "san", "santa", "santo", "saint", "agios", "agia", "hagia", "nuestra", "senora", "our", "lady",
  "del", "los", "las", "the", "and",
]);
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

// The words that tell a place apart: "Iglesia de San Pablo" → ["pablo"]; without accents, kind or town
const telltaleWords = (text, town) => {
  const words = (value) => (value ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().split(/[^a-z0-9]+/);
  const townWords = new Set(words(town));
  return words(text).filter((word) => word.length > 2 && !GENERIC_WORDS.has(word) && !townWords.has(word));
};

// The article's title names the stop: they share a telltale word ("Santa Sofía (Salónica)" does not name San Pablo).
// A stop named only by its kind ("Catedral") has nothing to compare, and the distance alone decides.
const namesTheStop = (title, names, town) => {
  const titleWords = new Set(telltaleWords(title, town));
  const nameWords = names.flatMap((name) => telltaleWords(name, town));
  return nameWords.length === 0 || nameWords.some((word) => titleWords.has(word));
};

// A stop without history (no article was found when the itinerary was made, as with places the traveller asked
// for): its article searched by name and town, in the page's language and then the other one, kept only when it
// is about that same spot. `mapName`: the place's name on the map (often local or English), tried after the stop's
// own name. The article must be close (SAME_PLACE_KM) and its title must name the stop: Wikipedia's first result
// is often a famous neighbour. → { lang, title, url }, or a 404 when the place has none.
export const findArticle = async ({ name, mapName, town, lat, lng, lang }) => {
  if (!name || !isCoordinate(lat, lng)) throw badRequest("audioBadPlace");
  const names = [...new Set([name, mapName].filter(Boolean))];
  for (const wikiLang of [lang, ...WIKI_LANGS.filter((other) => other !== lang)]) {
    for (const searched of names) {
      const fact = await searchPlace(town ? `${searched} ${town}` : searched, wikiLang);
      const close = fact?.url && isCoordinate(fact.lat, fact.lng) && km({ lat, lng }, { lat: fact.lat, lng: fact.lng }) <= SAME_PLACE_KM;
      if (close && namesTheStop(fact.title, names, town)) {
        return readArticleUrl(fact.url);
      }
    }
  }
  throw new AppError("audioBadPlace", {}, 404);
};

// The same place's article in the other language we read ("Rotonda de Galerio" → en "Rotunda (Thessaloniki)"), or
// null. A second article gives the guide more to tell: English ones on monuments are often several times longer.
export const companionArticle = async ({ lang, title }) => {
  const other = WIKI_LANGS.find((wikiLang) => wikiLang !== lang);
  if (!other) return null;
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    redirects: "1",
    prop: "langlinks",
    lllang: other,
    titles: title,
  });
  try {
    const response = await fetch(`https://${lang}.wikipedia.org/w/api.php?${params}`, {
      headers: { "user-agent": UA },
      next: { revalidate: MONTH },
    });
    if (!response.ok) return null;
    // A link may point to a section of a wider article ("Arch of Galerius and Rotunda#Rotunda of Galerius"): the whole
    // article is read, and the prompt keeps the guide to this place
    const linked = (await response.json()).query?.pages?.[0]?.langlinks?.[0]?.title?.split("#")[0];
    return linked ? readArticleUrl(`https://${other}.wikipedia.org/wiki/${encodeURIComponent(linked.replace(/ /g, "_"))}`) : null;
  } catch (error) {
    console.error("Wikipedia langlinks error", error);
    return null;
  }
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
