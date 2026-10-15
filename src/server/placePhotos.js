// The photo of any town (a trip planned by hand goes anywhere, not only where Ryanair and Wizz fly), by its
// name and where it is. Only called from the server.
// Wikipedia, in the name's language: the article with that title, if it is really there (within 25 km: not
// the other Pamplona); otherwise the nearby article whose title starts with the name ("Pamplona (Colombia)").
// Wikidata: that place's own image (P18, usually a view of the town; the article's lead image can be a flag).
// When that is a montage of several photos (Turin), its aerial or night view if it has one, else the lead photo
// of its article in another Wikipedia (Italian: Turin from Monte dei Cappuccini); a montage only as a last resort.
// Wikimedia Commons: the thumbnail, author and licence (server/commons).
import { MONTH, UA, commons } from "@/server/commons";
import { km } from "@/utils/itinerary";
import { normalize } from "@/utils/format";

// How far the article's place may be from the given point and still be that town
const SAME_PLACE_KM = 25;
// Properties with a view of a place: its image, aerial view, view by night
const VIEWS = ["P18", "P8592", "P3451"];
const isMontage = (file) => /montage|collage|colaj|collag/i.test(file);
// Wikipedias to look in for a photo when the town's own image is a montage (the local one usually has the best)
const OTHER_WIKIS = ["it", "de", "fr", "es", "pt", "pl", "nl", "ro", "hu", "cs", "el", "hr", "en"];
// Lead images that are not photos of the place
const notAPhoto = (file) => !file || /\.(svg|gif)$/i.test(file) || /(^|[_ -])(map|flag|coat|arms|coa|wappen|stema|stemma|herb|escudo|blason|bandera|flagge|locator|logo|seal)([_ .()-]|$)/i.test(file);
const LANGS = ["es", "en"];
const cache = new Map(); // place key → photo or null, for the life of the server instance

const wikipedia = async (lang, params) => {
  const query = new URLSearchParams({ action: "query", format: "json", redirects: "1", prop: "coordinates|pageprops", ppprop: "wikibase_item", ...params });
  const response = await fetch(`https://${lang}.wikipedia.org/w/api.php?${query}`, { headers: { "user-agent": UA }, next: { revalidate: MONTH } });
  if (!response.ok) throw new Error(`Wikipedia responded with error ${response.status}`);
  return Object.values((await response.json()).query?.pages ?? {});
};

// The Wikidata item of the town's article in `lang`, or null
const placeItem = async (lang, { city, lat, lng }, withinKm) => {
  const point = { lat, lng };
  const isHere = (page) => page.coordinates && km(point, { lat: page.coordinates[0].lat, lng: page.coordinates[0].lon }) < withinKm;
  const titled = (await wikipedia(lang, { titles: city })).find((page) => page.pageprops?.wikibase_item && isHere(page));
  if (titled) return titled.pageprops.wikibase_item;
  const nearby = (await wikipedia(lang, { generator: "geosearch", ggscoord: `${lat}|${lng}`, ggsradius: "10000", ggslimit: "50" })).sort(
    (first, second) => first.index - second.index
  );
  const named = nearby.find((page) => page.pageprops?.wikibase_item && normalize(page.title).startsWith(normalize(city)));
  return named?.pageprops.wikibase_item ?? null;
};

// The first image file of a Wikidata item's property, or null
const itemFile = async (item, property) => {
  const response = await fetch(`https://www.wikidata.org/w/api.php?action=wbgetclaims&format=json&entity=${item}&property=${property}`, {
    headers: { "user-agent": UA },
    next: { revalidate: MONTH },
  });
  if (!response.ok) throw new Error(`Wikidata responded with error ${response.status}`);
  return (await response.json()).claims?.[property]?.[0]?.mainsnak?.datavalue?.value ?? null;
};

// A lead photo (not a montage) of the item's article in another Wikipedia, or null
const otherWikiPhoto = async (item) => {
  const response = await fetch(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=sitelinks&ids=${item}`, {
    headers: { "user-agent": UA },
    next: { revalidate: MONTH },
  });
  if (!response.ok) return null;
  const sitelinks = (await response.json()).entities?.[item]?.sitelinks ?? {};
  for (const wikiLang of OTHER_WIKIS.filter((candidate) => sitelinks[`${candidate}wiki`]).slice(0, 5)) {
    const query = new URLSearchParams({ action: "query", format: "json", prop: "pageimages", piprop: "name", titles: sitelinks[`${wikiLang}wiki`].title });
    const pages = await fetch(`https://${wikiLang}.wikipedia.org/w/api.php?${query}`, { headers: { "user-agent": UA }, next: { revalidate: MONTH } })
      .then((answer) => answer.json())
      .catch(() => null);
    const file = Object.values(pages?.query?.pages ?? {})[0]?.pageimage;
    if (file && !isMontage(file) && !notAPhoto(file)) return file;
  }
  return null;
};

// The item's view of the place: its image, unless that is a montage (then its aerial or night view, or a photo
// from another Wikipedia, or at last the montage)
const itemImage = async (item) => {
  let montage = null;
  for (const property of VIEWS) {
    const file = await itemFile(item, property);
    if (file && !isMontage(file)) return file;
    montage ??= file;
  }
  return (montage && (await otherWikiPhoto(item))) || montage;
};

// { src, width, height, page, author, license } or null. place: { city, lat, lng }; `lang`: the name's language
// (tried first; then the other one). `withinKm`: how far the town may be (an airport named after a city some
// way off, like Weeze for Düsseldorf, needs more).
export const getPlacePhoto = async (place, lang = "es", withinKm = SAME_PLACE_KM) => {
  const key = `${normalize(place.city)}@${place.lat.toFixed(2)},${place.lng.toFixed(2)}`;
  if (cache.has(key)) return cache.get(key);
  let photo = null;
  for (const wikiLang of [lang, ...LANGS.filter((other) => other !== lang)]) {
    const item = await placeItem(wikiLang, place, withinKm);
    if (!item) continue;
    const file = await itemImage(item);
    if (file) photo = Object.values(await commons([file]))[0] ?? null;
    break;
  }
  cache.set(key, photo);
  return photo;
};
