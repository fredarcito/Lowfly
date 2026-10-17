// The route pages (/es/flights/malta-barcelona): which exist and what each one is. One per destination city from
// each origin we publish, with all its airports (Milan: Malpensa and Bergamo). Only called from the server.
import { getDestinations } from "@/server/flights";
import { regionOf } from "@/server/flightRoutes/regions";
import { getAirports } from "@/server/airports";
import { normalize } from "@/utils/format";

// The airports whose routes have pages: Malta and every Spanish airport Ryanair or Wizz Air fly from. One per city
// (Tenerife North, Wizz Air only, would share Tenerife South's address).
export const ROUTE_ORIGINS = [
  "MLA",
  // Spain
  "ACE", "AGP", "ALC", "BCN", "BIO", "CDT", "FUE", "GRO", "GRX", "IBZ", "LEI", "LPA", "MAD", "MAH", "OVD", "PMI", "REU", "RMU",
  "SCQ", "SDR", "SVQ", "TFS", "VIT", "VLC", "ZAZ",
];

// "Malta" + "Barcelona" → "malta-barcelona" (no accents, only letters, digits and dashes)
const slugOf = (...names) =>
  names
    .map((name) => normalize(name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))
    .join("-");

// Every route from `origin`, by destination city, named in `lang`
const citiesFrom = async (origin, lang) => {
  const [{ destinations }, { airports }] = await Promise.all([getDestinations(origin, lang), getAirports(lang)]);
  const byCode = new Map(airports.map((airport) => [airport.code, airport]));
  const home = byCode.get(origin);
  if (!home) return [];
  const byCity = new Map();
  for (const destination of destinations) {
    const key = `${destination.city}|${destination.countryCode}`;
    const route = byCity.get(key) ?? {
      origin: { code: home.code, city: home.city, country: home.country, tz: home.tz },
      city: destination.city,
      country: destination.country,
      countryCode: destination.countryCode,
      region: regionOf(destination.countryCode),
      airports: [],
    };
    route.airports.push({ code: destination.code, airlines: destination.airlines, tz: byCode.get(destination.code)?.tz });
    byCity.set(key, route);
  }
  return [...byCity.values()];
};

// The same address in every language: built from the English names. Two cities with one name say their country.
const withSlugs = (routes) => {
  const slugs = routes.map((route) => slugOf(route.origin.city, route.city));
  return routes.map((route, index) => ({
    ...route,
    slug: slugs.filter((slug) => slug === slugs[index]).length > 1 ? slugOf(route.origin.city, route.city, route.country) : slugs[index],
  }));
};

// Every route from `origin`: [{ slug, origin: { code, city, country, tz }, city, country, countryCode,
// airports: [{ code, airlines, tz }] }], named in `lang`, by city name
export const routesFrom = async (origin, lang = "es") => {
  const english = withSlugs(await citiesFrom(origin, "en"));
  const slugByAirport = new Map(english.map((route) => [route.airports[0].code, route.slug]));
  const routes = lang === "en" ? english : await citiesFrom(origin, lang);
  return routes
    .map((route) => ({ ...route, slug: slugByAirport.get(route.airports[0].code) }))
    .filter((route) => route.slug)
    .sort((first, second) => first.city.localeCompare(second.city, lang));
};

// The airports we publish routes from, each with its own page (/es/flights/malta): [{ slug, code, city, country,
// countryCode }]. Two with one address: the first one listed.
export const origins = async (lang = "es") => {
  const [{ airports: english }, { airports: local }] = await Promise.all([getAirports("en"), getAirports(lang)]);
  const found = ROUTE_ORIGINS.map((code) => {
    const name = english.find((airport) => airport.code === code);
    const here = local.find((airport) => airport.code === code);
    return name && here ? { slug: slugOf(name.city), code, city: here.city, country: here.country, countryCode: here.countryCode } : null;
  }).filter(Boolean);
  return found.filter((origin, index) => found.findIndex((other) => other.slug === origin.slug) === index);
};

// An origin's page by its address, or null
export const findOrigin = async (slug, lang = "es") => (await origins(lang)).find((origin) => origin.slug === slug) ?? null;

// Every route page from all the origins we publish
export const allRoutes = async (lang = "es") => (await Promise.all(ROUTE_ORIGINS.map((origin) => routesFrom(origin, lang)))).flat();

// One route by its address, in `lang`, or null. Only the airports its address starts with are looked into
// ("madrid-…": Madrid's routes), not every origin's.
export const findRoute = async (slug, lang = "es") => {
  const candidates = (await origins(lang)).filter((origin) => slug.startsWith(`${origin.slug}-`));
  const routes = (await Promise.all(candidates.map((origin) => routesFrom(origin.code, lang)))).flat();
  return routes.find((route) => route.slug === slug) ?? null;
};
