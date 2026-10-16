// Destination photos, found by airport code. Only called from the server.
// Wikidata: airport (IATA code) → city it serves → its English Wikipedia article. When an airport serves
// several cities (Treviso: Venice and Treviso) the most populated one with a real photo wins.
// Wikipedia: the article's lead image (curated, nicer than Wikidata's own image). Some articles have none, or
// only a montage, a map or a coat of arms (London, Southend): then the city's own image on Wikidata (P18).
// Last, an airport whose city is not on Wikidata: the town by its name and place (server/placePhotos).
// Wikimedia Commons: an 800 px thumbnail plus author and licence, needed to credit the photo (server/commons).
import { getAirports } from "@/server/airports";
import { MONTH, UA, commons } from "@/server/commons";
import { getPlacePhoto } from "@/server/placePhotos";

const cache = new Map(); // code → photo or null, for the life of the server instance
// How far the city an airport is named after may be (Düsseldorf Weeze is ~70 km from Düsseldorf)
const AIRPORT_CITY_KM = 100;

const cityArticles = async (codes) => {
  const query = `SELECT ?iata ?article ?pop ?image WHERE {
    VALUES ?iata { ${codes.map((code) => `"${code}"`).join(" ")} }
    ?airport wdt:P238 ?iata; wdt:P931 ?city.
    ?article schema:about ?city; schema:isPartOf <https://en.wikipedia.org/>.
    OPTIONAL { ?city wdt:P1082 ?pop }
    OPTIONAL { ?city wdt:P18 ?image }
  }`;
  const response = await fetch(`https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}`, {
    headers: { accept: "application/sparql-results+json", "user-agent": UA },
    next: { revalidate: MONTH },
  });
  if (!response.ok) throw new Error(`Wikidata responded with error ${response.status}`);
  // Per airport, its cities from most to least populated, with their Wikidata image (a file name or null):
  // { TSF: [{ title: "Venice", image: "Venice….jpg" }, { title: "Treviso", image: null }] }
  const found = {};
  for (const binding of (await response.json()).results.bindings) {
    const title = decodeURIComponent(binding.article.value.split("/wiki/").pop()).replace(/_/g, " ");
    const image = binding.image ? decodeURIComponent(binding.image.value.split("/Special:FilePath/").pop()) : null;
    const cities = (found[binding.iata.value] ??= []);
    // A city with several images or populations comes once, with the first
    if (!cities.some((city) => city.title === title)) cities.push({ title, image, pop: Number(binding.pop?.value) || 0 });
  }
  return Object.fromEntries(Object.entries(found).map(([code, cities]) => [code, cities.sort((first, second) => second.pop - first.pop)]));
};

// Lead images that are not photos of the place: maps, flags, coats of arms, logos, diagrams
const notAPhoto = (file) => !file || /\.(svg|png|gif)$/i.test(file) || /(^|[_ -])(map|flag|coat|arms|coa|wappen|stema|stemma|herb|escudo|blason|bandera|flagge|locator|logo|seal)([_ .()-]|$)/i.test(file);

// Lead image file of each article: { "Venice": "Venezia_aerial_view.jpg" }
const leadImages = async (titles) => {
  const response = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=name&redirects=1&titles=${encodeURIComponent(titles.join("|"))}`,
    { headers: { "user-agent": UA }, next: { revalidate: MONTH } }
  );
  if (!response.ok) throw new Error(`Wikipedia responded with error ${response.status}`);
  const result = (await response.json()).query || {};
  const files = Object.fromEntries(Object.values(result.pages || {}).map((page) => [page.title, page.pageimage]));
  // The answer uses the final title: map back the ones we asked for under another name
  for (const { from, to } of [...(result.normalized || []), ...(result.redirects || [])]) files[from] ??= files[to];
  return files;
};

// One airport's photo, or null. Each lookup asks about this airport alone, so its answers are cached on their own
// (Next's data cache, a month, shared by every server instance) and found again for any list it is in.
const findPhoto = async (code) => {
  const cities = (await cityArticles([code]))[code] || [];
  const lead = cities.length ? await leadImages(cities.map((city) => city.title)) : {};
  // The first lead image that is a photo, else the first Wikidata image that is
  const file = cities.map((city) => lead[city.title]).find((candidate) => !notAPhoto(candidate)) ?? cities.map((city) => city.image).find((candidate) => !notAPhoto(candidate));
  if (file) {
    const info = await commons([file]);
    // Commons may normalise the file name (underscores, capitals): compare loosely
    const norm = (title) => title.replace(/_/g, " ").toLowerCase();
    const photo = Object.entries(info).find(([title]) => norm(title) === norm(file))?.[1];
    if (photo) return photo;
  }
  // An airport whose city Wikidata does not know (Weeze for Düsseldorf, Turin, Dubai…): the town by its name and
  // where it is, as for a trip planned by hand. The city it is named after can be some way off (Teesside)
  const { airports } = await getAirports("en").catch(() => ({ airports: [] }));
  const airport = airports.find((candidate) => candidate.code === code);
  if (airport?.lat == null) return null;
  return getPlacePhoto({ city: airport.city, lat: airport.lat, lng: airport.lon }, "en", AIRPORT_CITY_KM).catch(() => null);
};

// { CTA: { src, width, height, page, author, license }, NRN: null, … }. The airports are looked up side by side.
// An airport whose lookup failed (Wikidata is often busy) is left out, so it is not taken for one without a photo.
export const getPhotos = async (codes) => {
  const missing = codes.filter((code) => !cache.has(code));
  await Promise.all(
    missing.map(async (code) => {
      const photo = await findPhoto(code).catch((error) => {
        console.error("Photo of", code, error.message);
        return undefined;
      });
      // A failure is not remembered: it is asked again next time
      if (photo !== undefined) cache.set(code, photo);
    })
  );
  return Object.fromEntries(codes.filter((code) => cache.has(code)).map((code) => [code, cache.get(code)]));
};
