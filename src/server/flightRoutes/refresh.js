// Builds one airport's route pages from the airlines and saves them (server/flightRoutes/snapshots): its routes in
// every language, its page and every route's prices. Only the cron calls it (app/api/cron/flight-routes), once a
// day per airport: about 25 requests to the airlines for all of its routes. Only called from the server.
import { getDestinations } from "@/server/flights";
import { getAirports } from "@/server/airports";
import { regionOf } from "@/server/flightRoutes/regions";
import { originMonths, routeMonths } from "@/server/flightRoutes/prices";
import { saveSnapshot } from "@/server/flightRoutes/snapshots";
import { LOCALES } from "@/i18n/config";
import { normalize } from "@/utils/format";

// "Malta" + "Barcelona" → "malta-barcelona" (no accents, only letters, digits and dashes)
const slugOf = (...names) =>
  names
    .map((name) => normalize(name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))
    .join("-");

// Every route from `origin`, by destination city, named in `lang`: { routes, failed } (the live airlines that did
// not answer)
const citiesFrom = async (origin, lang) => {
  const [{ destinations, failed }, { airports }] = await Promise.all([getDestinations(origin, lang), getAirports(lang)]);
  const byCode = new Map(airports.map((airport) => [airport.code, airport]));
  const home = byCode.get(origin);
  if (!home) return { routes: [], failed };
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
    const airport = byCode.get(destination.code);
    route.airports.push({ code: destination.code, name: airport?.name ?? null, airlines: destination.airlines, tz: airport?.tz });
    byCity.set(key, route);
  }
  return { routes: [...byCity.values()], failed };
};

// The same address in every language: built from the English names. Two cities with one name say their country.
const withSlugs = (routes) => {
  const slugs = routes.map((route) => slugOf(route.origin.city, route.city));
  return routes.map((route, index) => ({
    ...route,
    slug: slugs.filter((slug) => slug === slugs[index]).length > 1 ? slugOf(route.origin.city, route.city, route.country) : slugs[index],
  }));
};

// Every route from `origin` in every language, by city name: { routes: { es: [...], en: [...] }, failed }
const routesOf = async (origin) => {
  const english = await citiesFrom(origin, "en");
  const named = withSlugs(english.routes);
  const slugByAirport = new Map(named.map((route) => [route.airports[0].code, route.slug]));
  const failed = new Set(english.failed);
  const routes = {};
  for (const lang of LOCALES) {
    const local = lang === "en" ? english : await citiesFrom(origin, lang);
    local.failed.forEach((airline) => failed.add(airline));
    routes[lang] = (lang === "en" ? named : local.routes)
      .map((route) => ({ ...route, slug: slugByAirport.get(route.airports[0].code) }))
      .filter((route) => route.slug)
      .sort((first, second) => first.city.localeCompare(second.city, lang));
  }
  return { routes, failed: [...failed] };
};

// The airport's own page in every language: { es: { slug, code, city, country, countryCode }, en: { … } }, or
// null when the airlines do not know it
const infoOf = async (origin) => {
  const lists = Object.fromEntries(await Promise.all(LOCALES.map(async (lang) => [lang, (await getAirports(lang)).airports])));
  const english = lists.en.find((airport) => airport.code === origin);
  if (!english) return null;
  const info = {};
  for (const lang of LOCALES) {
    const here = lists[lang].find((airport) => airport.code === origin);
    if (!here) return null;
    info[lang] = { slug: slugOf(english.city), code: origin, city: here.city, country: here.country, countryCode: here.countryCode };
  }
  return info;
};

// Builds and saves `origin`'s snapshot: { origin, routes (how many), failed }. When a live airline did not answer,
// a snapshot already saved (`saved` true) is kept rather than replaced by a worse one: { …, kept: true }.
export const refreshOrigin = async (origin, { saved = false } = {}) => {
  const [info, { routes, failed: routesFailed }, { months, failed: pricesFailed }] = await Promise.all([
    infoOf(origin),
    routesOf(origin),
    originMonths(origin),
  ]);
  const failed = [...new Set([...routesFailed, ...pricesFailed])];
  if (!info || !routes.en.length) throw new Error(`No routes found from ${origin}`);
  const summary = { origin, routes: routes.en.length, failed };
  if (failed.length && saved) return { ...summary, kept: true };
  const prices = Object.fromEntries(
    routes.en.map((route) => [route.slug, routeMonths(route, months)]).filter(([, routePrices]) => routePrices)
  );
  await saveSnapshot({ origin, info, routes, prices });
  return summary;
};
