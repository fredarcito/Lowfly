// The multi-city routes' own pages (/es/recorridos/italia-clasica; docs/multi-city.md, route pages): what the route
// is like, town by town, written once per route in src/data/multiCityPages.json (reviewed by hand, never made on a
// visit) and joined here with the route's data (its versions, towns, nights and land legs). No prices: the page
// sends to the "Recorridos" search. Only read on the server.
import pages from "@/data/multiCityPages.json";
import { multiCityRoute } from "@/server/multiCity/routes";
import { cityGuideById } from "@/server/cityGuides";
import { RECOMMENDED_VERSION } from "@/constants/multiCity";

const VERSION_ORDER = ["short", "full", "long"];

// The days of a version, the fewest and the ideal: landing on day 1 and flying home after its nights
const daysOf = (stops) => ({
  min: stops.reduce((total, stop) => total + stop.nights.min, 0) + 1,
  ideal: stops.reduce((total, stop) => total + stop.nights.ideal, 0) + 1,
});

// A route's versions in order of length: [{ version, days: { min, ideal }, towns: [{ key, city, nights, land }] }]
// (`key`: the town's English name, its text's key; `land`: how you get to the next one, or null for the last)
const versionsOf = (route, lang) =>
  VERSION_ORDER.filter((version) => route.versions[version]).map((version) => {
    const { stops } = route.versions[version];
    return {
      version,
      days: daysOf(stops),
      towns: stops.map((stop) => ({ key: stop.city.en, city: stop.city[lang], nights: stop.nights.ideal, land: stop.land ?? null })),
    };
  });

// Every stop of the route in the order of its longest version, with its text, its photo (chosen by hand, or null),
// its guide (or null), its nights in the recommended version (else the first it is in), the versions it is in, and the
// way by land to the next town in that order (or null for the last): [{ id, key, city, countryCode, lat, lng, nights,
// versions, photo, guide, land: { minutes, by, to }, text, see, tip }] (`words`: each town's text and `photos` each
// town's photo, by its English name). A route that comes back to where it started (Nápoles → … → Nápoles) has that
// town twice, so `key` (the town's name, which its text is found by) is not unique: the page keys its towns by their
// place on the line.
const townsOf = (route, versions, words, photos, lang) => {
  const longest = route.versions[versions.at(-1).version].stops;
  return longest.map((stop, index) => {
    const key = stop.city.en;
    const inVersions = versions.filter((version) => version.towns.some((town) => town.key === key));
    const guide = stop.guide ? cityGuideById(stop.guide, lang) : null;
    return {
      id: `${key}-${index}`,
      key,
      city: stop.city[lang],
      countryCode: stop.countryCode,
      lat: stop.lat,
      lng: stop.lng,
      nights: (inVersions.find((version) => version.version === RECOMMENDED_VERSION) ?? inVersions[0]).towns.find((town) => town.key === key).nights,
      versions: inVersions.map((version) => version.version),
      photo: photos[key] ?? null,
      land: stop.land && longest[index + 1] ? { ...stop.land, to: longest[index + 1].city[lang] } : null,
      guide: guide && { slug: guide.slug, city: guide.city, dayCount: guide.dayCount },
      ...words[key],
    };
  });
};

// One route's page in `lang` by the route's id, or null: { id, slug, slugs, kind, name, photo, months, reversible,
// days: { min, max }, versions, towns, writtenAt, title, metaTitle, summary, why, gettingAround, bestTime, faq }
const pageIn = (id, lang) => {
  const page = pages[id];
  const route = multiCityRoute(id);
  if (!page?.[lang] || !route) return null;
  const versions = versionsOf(route, lang);
  // Its words, but its towns' words go into its towns
  const { towns, ...words } = page[lang];
  return {
    ...words,
    id,
    slug: page.slugs[lang] ?? id,
    slugs: page.slugs,
    kind: route.kind,
    name: route.name[lang],
    photo: route.photo ?? null,
    months: route.months ?? [],
    reversible: route.reversible,
    days: { min: versions[0].days.min, max: versions.at(-1).days.ideal },
    versions,
    towns: townsOf(route, versions, towns, page.photos ?? {}, lang),
    writtenAt: page.writtenAt,
  };
};

// The id of the page named `slug` in any language, or null
const pageId = (slug) => Object.keys(pages).find((id) => id === slug || Object.values(pages[id].slugs ?? {}).includes(slug)) ?? null;

// One route's page in `lang` by its name in that language (italia-clasica), or null
export const getRoutePage = (slug, lang) => {
  const id = pageId(slug);
  const page = id ? pageIn(id, lang) : null;
  return page?.slug === slug ? page : null;
};

// The same page's name in `lang` (from its name in any language), or null: where an address in the wrong language
// goes
export const routePageSlugIn = (slug, lang) => {
  const id = pageId(slug);
  return id ? (pageIn(id, lang)?.slug ?? null) : null;
};

// Every route page in `lang` (the sitemap, the static pages): [{ id, slug, slugs, name, days }]
export const listRoutePages = (lang) =>
  Object.keys(pages)
    .map((id) => pageIn(id, lang))
    .filter(Boolean)
    .map(({ id, slug, slugs, name, days, towns }) => ({ id, slug, slugs, name, days, towns: towns.map((town) => town.city) }));

// The route pages a city guide's town is in (a guide links to them): [{ id, slug, name, days, towns }]
export const routePagesWithGuide = (guideId, lang) =>
  listRoutePages(lang).filter((page) =>
    Object.values(multiCityRoute(page.id).versions).some((version) => version.stops.some((stop) => stop.guide === guideId))
  );
