// The route pages (/es/flights/malta-barcelona): which exist and what each one is. One per destination city from
// each origin we publish, with all its airports (Milan: Malpensa and Bergamo). Read from what the cron last saved
// (server/flightRoutes/snapshots; built by server/flightRoutes/refresh), never from the airlines. Only called from
// the server.
import { readAllRoutes, readOrigin, readOrigins } from "@/server/flightRoutes/snapshots";

// The airports whose routes have pages: Malta and every Spanish airport Ryanair or Wizz Air fly from. One per city
// (Tenerife North, Wizz Air only, would share Tenerife South's address).
export const ROUTE_ORIGINS = [
  "MLA",
  // Spain
  "ACE", "AGP", "ALC", "BCN", "BIO", "CDT", "FUE", "GRO", "GRX", "IBZ", "LEI", "LPA", "MAD", "MAH", "OVD", "PMI", "REU", "RMU",
  "SCQ", "SDR", "SVQ", "TFS", "VIT", "VLC", "ZAZ",
];

const listed = (first, second) => ROUTE_ORIGINS.indexOf(first) - ROUTE_ORIGINS.indexOf(second);

// Every route from `origin`: [{ slug, origin: { code, city, country, tz }, city, country, countryCode, region,
// airports: [{ code, name, airlines, tz }] }], named in `lang`, by city name
export const routesFrom = async (origin, lang = "es") => (await readOrigin(origin, lang))?.routes ?? [];

// The airports we publish routes from, each with its own page (/es/flights/malta): [{ slug, code, city, country,
// countryCode, updatedAt }] (updatedAt: when the cron last wrote it), in ROUTE_ORIGINS' order. Two with one address:
// the first one listed.
export const origins = async (lang = "es") => {
  const found = (await readOrigins())
    .filter((row) => ROUTE_ORIGINS.includes(row.origin))
    .sort((first, second) => listed(first.origin, second.origin))
    .map((row) => ({ ...row.info[lang], updatedAt: row.updated_at }));
  return found.filter((origin, index) => found.findIndex((other) => other.slug === origin.slug) === index);
};

// An origin's page by its address, or null
export const findOrigin = async (slug, lang = "es") => (await origins(lang)).find((origin) => origin.slug === slug) ?? null;

// Every route page from all the origins we publish, each with when the cron last wrote it (updatedAt)
export const allRoutes = async (lang = "es") =>
  (await readAllRoutes(lang))
    .filter((row) => ROUTE_ORIGINS.includes(row.origin))
    .sort((first, second) => listed(first.origin, second.origin))
    .flatMap((row) => (row.routes ?? []).map((route) => ({ ...route, updatedAt: row.updated_at })));

// One route by its address, in `lang`, or null. Only the airports its address starts with are looked into
// ("madrid-…": Madrid's routes), not every origin's.
export const findRoute = async (slug, lang = "es") => {
  const candidates = (await origins(lang)).filter((origin) => slug.startsWith(`${origin.slug}-`));
  const routes = (await Promise.all(candidates.map((origin) => routesFrom(origin.code, lang)))).flat();
  return routes.find((route) => route.slug === slug) ?? null;
};
