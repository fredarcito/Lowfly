// The city guides (/es/guides/rome-3-days): their introduction and itinerary in each language, as
// scripts/city-guides.mjs wrote them once (never made on a visit). Only read on the server, so the browser never
// downloads the whole file.
import guides from "@/data/cityGuides.json";

// One guide in `lang`: { slug, dayCount, codes, city, country, lat, lng, photo, intro, itinerary }, or null.
// `photo`: its own ({ src, page, author, license }), or null for its city's usual one (server/photos).
export const getCityGuide = (slug, lang) => {
  const guide = guides[slug];
  if (!guide?.[lang]) return null;
  const { es, en, ...about } = guide;
  const { intro, itinerary } = guide[lang];
  return { ...about, slug, city: about.city[lang], country: about.country[lang], photo: about.photo ?? null, intro, itinerary };
};

// Every guide in `lang`, without its itinerary (the guides' page, the sitemap): [{ slug, dayCount, codes, city,
// country, photo, intro }], by city name
export const listCityGuides = (lang) =>
  Object.keys(guides)
    .map((slug) => getCityGuide(slug, lang))
    .filter(Boolean)
    .map(({ itinerary, ...guide }) => guide)
    .sort((first, second) => first.city.localeCompare(second.city, lang));

// The guide of a destination airport (a route's page to Rome links to Rome's), or null: the shortest one
export const cityGuideFor = (code, lang) =>
  listCityGuides(lang)
    .filter((guide) => guide.codes.includes(code))
    .sort((first, second) => first.dayCount - second.dayCount)[0] ?? null;
