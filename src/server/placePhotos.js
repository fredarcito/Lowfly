// The photo of any town (a trip planned by hand goes anywhere, not only where Ryanair and Wizz fly), by its
// name and where it is. Only called from the server.
// Wikipedia, in the name's language: the article with that title, if it is really there (within 25 km: not
// the other Pamplona); otherwise the nearby article whose title starts with the name ("Pamplona (Colombia)").
// Wikidata: that place's own image (P18, usually a view of the town; the article's lead image can be a flag).
// Wikimedia Commons: the thumbnail, author and licence (server/photos).
import { MONTH, UA, commons } from "@/server/photos";
import { km } from "@/utils/itinerary";
import { normalize } from "@/utils/format";

const SAME_PLACE_KM = 25;
const LANGS = ["es", "en"];
const cache = new Map(); // place key → photo or null, for the life of the server instance

const wikipedia = async (lang, params) => {
  const query = new URLSearchParams({ action: "query", format: "json", redirects: "1", prop: "coordinates|pageprops", ppprop: "wikibase_item", ...params });
  const response = await fetch(`https://${lang}.wikipedia.org/w/api.php?${query}`, { headers: { "user-agent": UA }, next: { revalidate: MONTH } });
  if (!response.ok) throw new Error(`Wikipedia responded with error ${response.status}`);
  return Object.values((await response.json()).query?.pages ?? {});
};

// The Wikidata item of the town's article in `lang`, or null
const placeItem = async (lang, { city, lat, lng }) => {
  const point = { lat, lng };
  const isHere = (page) => page.coordinates && km(point, { lat: page.coordinates[0].lat, lng: page.coordinates[0].lon }) < SAME_PLACE_KM;
  const titled = (await wikipedia(lang, { titles: city })).find((page) => page.pageprops?.wikibase_item && isHere(page));
  if (titled) return titled.pageprops.wikibase_item;
  const nearby = (await wikipedia(lang, { generator: "geosearch", ggscoord: `${lat}|${lng}`, ggsradius: "10000", ggslimit: "50" })).sort(
    (first, second) => first.index - second.index
  );
  const named = nearby.find((page) => page.pageprops?.wikibase_item && normalize(page.title).startsWith(normalize(city)));
  return named?.pageprops.wikibase_item ?? null;
};

// The image file of a Wikidata item (P18), or null
const itemImage = async (item) => {
  const response = await fetch(`https://www.wikidata.org/w/api.php?action=wbgetclaims&format=json&entity=${item}&property=P18`, {
    headers: { "user-agent": UA },
    next: { revalidate: MONTH },
  });
  if (!response.ok) throw new Error(`Wikidata responded with error ${response.status}`);
  return (await response.json()).claims?.P18?.[0]?.mainsnak?.datavalue?.value ?? null;
};

// { src, width, height, page, author, license } or null. place: { city, lat, lng }; `lang`: the name's language
// (tried first; then the other one)
export const getPlacePhoto = async (place, lang = "es") => {
  const key = `${normalize(place.city)}@${place.lat.toFixed(2)},${place.lng.toFixed(2)}`;
  if (cache.has(key)) return cache.get(key);
  let photo = null;
  for (const wikiLang of [lang, ...LANGS.filter((other) => other !== lang)]) {
    const item = await placeItem(wikiLang, place);
    if (!item) continue;
    const file = await itemImage(item);
    if (file) photo = Object.values(await commons([file]))[0] ?? null;
    break;
  }
  cache.set(key, photo);
  return photo;
};
