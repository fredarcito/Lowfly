// The city guides (/es/guias/roma-3-dias): their introduction and itinerary in each language, as
// scripts/city-guides.mjs wrote them once (never made on a visit). Only read on the server, so the browser never
// downloads the whole file.
import guides from "@/data/cityGuides.json";

// One guide in `lang` by its id (rome-3-days): { id, slug, slugs, dayCount, codes, city, country, lat, lng, photo,
// intro, itinerary }, or null. `slug`: its name in the address in `lang` (roma-3-dias), `slugs`: in every
// language; `photo`: its own ({ src, page, author, license }), or null for its city's usual one (server/photos).
const guideIn = (id, lang) => {
  const guide = guides[id];
  if (!guide?.[lang]) return null;
  const { es, en, slugs = {}, ...about } = guide;
  const { intro, itinerary } = guide[lang];
  return {
    ...about,
    id,
    slug: slugs[lang] ?? id,
    slugs,
    city: about.city[lang],
    country: about.country[lang],
    photo: about.photo ?? null,
    intro,
    itinerary,
  };
};

// One guide in `lang` by its id (rome-3-days), or null: a multi-city route's town links to it
export const cityGuideById = (id, lang) => guideIn(id, lang);

// The id of the guide named `slug` in any language, or null
export const cityGuideId = (slug) =>
  Object.keys(guides).find((id) => id === slug || Object.values(guides[id].slugs ?? {}).includes(slug)) ?? null;

// One guide in `lang` by its name in that language (roma-3-dias), or null
export const getCityGuide = (slug, lang) => {
  const id = cityGuideId(slug);
  const guide = id ? guideIn(id, lang) : null;
  return guide?.slug === slug ? guide : null;
};

// The same guide's name in `lang` (from its name in any language), or null: where an address in the wrong
// language goes
export const cityGuideSlugIn = (slug, lang) => {
  const id = cityGuideId(slug);
  return id ? (guideIn(id, lang)?.slug ?? null) : null;
};

// How many places a guide visits (its sights, not its meals or moves)
const SIGHTS = new Set(["imprescindible", "recomendado", "opcional"]);
const placesIn = (itinerary) => itinerary.days.reduce((total, day) => total + day.stops.filter((stop) => SIGHTS.has(stop.type)).length, 0);

// Every guide in `lang`, without its itinerary but with how many places it visits (`placeCount`; the guides' page,
// the sitemap), by city name
export const listCityGuides = (lang) =>
  Object.keys(guides)
    .map((id) => guideIn(id, lang))
    .filter(Boolean)
    .map(({ itinerary, ...guide }) => ({ ...guide, placeCount: placesIn(itinerary) }))
    .sort((first, second) => first.city.localeCompare(second.city, lang));

// The guide of a destination airport (a route's page to Rome links to Rome's), or null: the shortest one
export const cityGuideFor = (code, lang) =>
  listCityGuides(lang)
    .filter((guide) => guide.codes.includes(code))
    .sort((first, second) => first.dayCount - second.dayCount)[0] ?? null;
