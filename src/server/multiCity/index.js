// Multi-city trips for the dates someone is free (docs/multi-city.md): routes we wrote, flown into one city and home
// from another (or the same), the cities between by land. Only the two flights have prices. Only called from the
// server.
//
// 1. Which routes can be flown from the origin: the route graph, no requests (possible.js).
// 2. Screening, 2–3 requests: the cheapest flight to every destination (Ryanair, Wizz's fare finder) picks the
//    routes worth pricing (rank.js pickCandidates).
// 3. Their flights in and home, per day, each airport and month once (server/dailyPrices routeFares, through the
//    airline guard's shared cache), joined with combineLegs.
// 4. The best trip of each version, the towns' nights shared out (fit.js), the routes in order (rank.js).
import * as ryanair from "@/server/ryanair";
import * as wizz from "@/server/wizz";
import * as more from "@/server/travelpayouts";
import { getAirports } from "@/server/airports";
import { getGraph } from "@/server/routeGraph";
import { legOf, routeFares } from "@/server/dailyPrices";
import { combineLegs } from "@/server/stopovers/combine";
import { estimatedArrival, landingDay } from "@/server/stopovers/connection";
import { MULTI_CITY_ROUTES } from "@/server/multiCity/routes";
import { possibleOptions } from "@/server/multiCity/possible";
import { MIN_WINDOW_NIGHTS, idealNights, nightsWithin, seasonWindow, shareNights, stayRange } from "@/server/multiCity/fit";
import { pickCandidates, rankRoutes, tripScore } from "@/server/multiCity/rank";
import { later, monthEnd, monthsBetween, nightsBetween, shift, tomorrow } from "@/utils/dates";

// Routes whose prices are asked in one search (each is a few requests the first time, shared after)
const MAX_CANDIDATES = 8;
// Wizz routes asked per day in one search, the best placed routes' first: Wizz answers 503 to a burst sooner than
// Ryanair (its guard then pauses it for everyone)
const MAX_WIZZ_ROUTES = 6;

// The requests with Wizz left out past its first MAX_WIZZ_ROUTES routes (in the order given)
const withinWizzBudget = (requests) => {
  const wizzRoutes = new Set();
  return requests
    .map((request) => {
      if (!request.airlines.includes("wizz")) return request;
      const key = `${request.dep}|${request.arr}`;
      if (wizzRoutes.has(key) || wizzRoutes.size < MAX_WIZZ_ROUTES) {
        wizzRoutes.add(key);
        return request;
      }
      return { ...request, airlines: request.airlines.filter((airline) => airline !== "wizz") };
    })
    .filter((request) => request.airlines.length);
};

// "IT" → "Italia" in `lang`
const countryNames = (lang) => {
  const names = new Intl.DisplayNames([lang], { type: "region" });
  return (code) => {
    try {
      return names.of(code) ?? code;
    } catch {
      return code;
    }
  };
};

// The months the screening asks Ryanair about: every month the flights in can fall in, whole (from tomorrow at the
// earliest), so every search from the origin that month shares the answer in the airline guard's cache, whatever its
// exact dates. Asked by the dates themselves, nearly every search would be a request of its own.
const screeningMonths = (from, lastOut) => monthsBetween(from, lastOut).map((month) => ({ from: later(month, tomorrow()), to: monthEnd(month) }));

// The cheapest flight in to every destination, from the screening: Map code → { price, airlines } (the airlines that
// fly there those months). Whole months: a price may fall outside the dates, but it only ranks the routes; the prices
// shown come from the flights per day within the dates. Wizz's fare finder already answers by month, and so do the
// more airlines' recent prices (easyJet, Vueling…: Travelpayouts, not live).
const cheapestIn = async (origin, from, lastOut, lang, failed) => {
  const months = screeningMonths(from, lastOut);
  const [ryanairFares, wizzFares, moreFares] = await Promise.all([
    Promise.all(months.map((month) => ryanair.cheapest(origin, month.from, month.to, lang)))
      .then((months) => months.flat())
      .catch(() => {
        failed.add("ryanair");
        return [];
      }),
    // A month whose cheapest Wizz fare fell outside the dates (`recheck`) still says Wizz flies there, at about that
    wizz
      .cheapest(origin, from, lastOut)
      .then(({ fares, recheck }) => [...fares, ...recheck])
      .catch(() => {
        failed.add("wizz");
        return [];
      }),
    // Theirs are not live: a failure only leaves them out
    Promise.all(months.map((month) => more.cheapest(origin, month.from, month.to, lang)))
      .then((answers) => answers.flat())
      .catch(() => []),
  ]);
  const found = new Map();
  for (const [airline, fares] of [
    ["ryanair", ryanairFares],
    ["wizz", wizzFares],
    [null, moreFares],
  ])
    for (const fare of fares) {
      const fareAirline = airline ?? fare.airline;
      const known = found.get(fare.code) ?? { price: Infinity, airlines: new Set() };
      found.set(fare.code, { price: Math.min(known.price, fare.price), airlines: known.airlines.add(fareAirline) });
    }
  return found;
};

// A flight as the results show it: an estimated arrival when the airline gives none (Wizz), and the day it lands
// when that is after midnight
const shownLeg = (leg, airportsByCode) => {
  const estimate = !leg.arrive && estimatedArrival(leg, airportsByCode.get(leg.from), airportsByCode.get(leg.to));
  const arriveDay = landingDay(leg, airportsByCode);
  return { ...leg, ...(estimate && { arriveEstimate: estimate }), ...(arriveDay !== leg.day && { arriveDay }) };
};

// The flights to ask for one way of doing a route, within its dates. Flying in, only the airlines the screening found
// flying there (`screened`, cheapestIn): fewer requests, Wizz's above all, which blocks us soonest
const requestsOf = (option, origin, screened) => {
  const { window, stay } = option;
  const flyingIn = (airport) => airport.airlines.filter((airline) => screened?.get(airport.code)?.airlines.has(airline) ?? true);
  return {
    in: option.entry
      .map((airport) => ({ dep: origin, arr: airport.code, airlines: flyingIn(airport), from: window.from, to: shift(window.to, -stay.min) }))
      .filter((request) => request.airlines.length),
    home: option.exit.map((airport) => ({ dep: airport.code, arr: origin, airlines: airport.airlines, from: shift(window.from, stay.min), to: window.to })),
  };
};

// The best trip of one way of doing a route (version and direction), or null: the flights in and home joined with
// the nights the version allows, the one nearest its ideal stay for the price
const bestTrip = (option, origin, fares, airportsByCode, countryName, lang) => {
  const requests = requestsOf(option, origin);
  if (!requests.in.length) return null;
  const flightsIn = legOf(fares, requests.in, requests.in[0].from, requests.in[0].to);
  const flightsHome = legOf(fares, requests.home, requests.home[0].from, requests.home[0].to);
  if (!flightsIn.length || !flightsHome.length) return null;
  const ideal = idealNights(option.stops);
  const trips = combineLegs([flightsIn, flightsHome], [option.stay]).map(({ price, legs }) => {
    const [flightIn, flightHome] = legs;
    // Nights count from the day you land (a flight landing after midnight is a night fewer)
    const landed = nightsBetween(landingDay(flightIn, airportsByCode), flightHome.day);
    const nights = shareNights(option.stops, landed) ? landed : nightsBetween(flightIn.day, flightHome.day);
    return { price, legs, nights, idealNights: ideal };
  });
  if (!trips.length) return null;
  const best = trips.reduce((chosen, trip) => (tripScore(trip) < tripScore(chosen) ? trip : chosen));
  const nightsPerTown = shareNights(option.stops, best.nights);
  const [flightIn] = best.legs;
  const first = option.stops[0];
  return {
    version: option.version,
    direction: option.direction,
    price: best.price,
    cur: "EUR",
    day: flightIn.day,
    nights: best.nights,
    idealNights: ideal,
    // Like a fare: where it lands first (for its photo and the flights' "Out" / "Back")
    code: flightIn.to,
    city: first.city[lang],
    country: countryName(first.countryCode),
    legs: best.legs.map((leg) => shownLeg(leg, airportsByCode)),
    // Between the two flights there is no connection to show: the towns are in `towns`
    stops: [],
    towns: option.stops.map((stop, index) => ({
      // Its place in the route as written, for the planner (utils/manualTrips stopsParam): "classic-italy/full/2"
      ref: `${option.route.id}/${option.version}/${stop.index}`,
      city: stop.city[lang],
      country: countryName(stop.countryCode),
      countryCode: stop.countryCode,
      lat: stop.lat,
      lng: stop.lng,
      code: stop.codes[0] ?? null,
      nights: nightsPerTown[index],
      ...(stop.land && { land: stop.land }),
      ...(stop.guide && { guide: stop.guide }),
    })),
  };
};

// A route as the results show it, in `lang`. `bestVersion`: the version whose trip ranked it (rank.js tripScore),
// the one its card shows first, so the order and the prices seen agree.
const describeRoute = (route, trips, countryName, lang) => ({
  id: route.id,
  kind: route.kind,
  name: route.name[lang],
  summary: route.summary[lang],
  note: route.note?.[lang] ?? null,
  countries: route.countries.map(countryName),
  season: route.season ? { name: route.season.name[lang], from: route.season.from, to: route.season.to } : null,
  bestVersion: trips.reduce((best, trip) => (tripScore(trip) < tripScore(best) ? trip : best)).version,
  // Chosen once and kept in its file (scripts/multi-city-photos.mjs): its card asks for no photo
  photo: route.photo ?? null,
  // Shortest first: the card shows the longest by default, the others one tap away
  trips: trips.sort((first, second) => first.nights - second.nights),
});

// The trips for the free dates `from` to `to` (both included, 4 to 14 nights) from `origin`:
// { origin, from, to, routes: [{ id, kind, name, summary, note, countries, season, trips: [{ version, direction,
//   price, cur, day, nights, idealNights, code, city, country, legs, stops, towns }] }], failed: [airlines] }
export const multiCityTrips = async ({ origin, from, to, lang = "es" }) => {
  const failed = new Set();
  const empty = { origin, from, to, routes: [], failed: [] };
  const [graph, { airports }] = await Promise.all([getGraph(), getAirports(lang)]);
  if (!graph) return empty;
  const airportsByCode = new Map(airports.map((airport) => [airport.code, airport]));
  const countryName = countryNames(lang);

  // Every way to do every route that fits the dates (its season's part of them)
  const options = possibleOptions(origin, MULTI_CITY_ROUTES, graph)
    .map((option) => {
      const window = seasonWindow(option.route, from, to);
      const stay = window && stayRange(option.stops, nightsWithin(window));
      return stay ? { ...option, window, stay } : null;
    })
    .filter(Boolean);
  if (!options.length) return empty;

  const screened = await cheapestIn(origin, from, shift(to, -MIN_WINDOW_NIGHTS), lang, failed);
  const byRoute = new Map();
  for (const option of options) byRoute.set(option.route, [...(byRoute.get(option.route) ?? []), option]);
  const context = { month: Number(from.slice(5, 7)), homeCountry: airportsByCode.get(origin)?.countryCode };
  const candidates = [...byRoute.entries()].map(([route, routeOptions]) => ({
    route,
    entryPrice: Math.min(...routeOptions.flatMap((option) => option.entry.map((airport) => screened.get(airport.code)?.price ?? Infinity))),
  }));
  const chosen = pickCandidates(candidates, { ...context, limit: MAX_CANDIDATES });
  const chosenOptions = chosen.flatMap((route) => byRoute.get(route));

  const requests = withinWizzBudget(chosenOptions.flatMap((option) => Object.values(requestsOf(option, origin, screened)).flat()));
  const fares = await routeFares(requests, failed);

  const results = chosen
    .map((route) => {
      // Per version, the cheaper direction
      const byVersion = new Map();
      for (const option of byRoute.get(route)) {
        const trip = bestTrip(option, origin, fares, airportsByCode, countryName, lang);
        const known = byVersion.get(option.version);
        if (trip && (!known || tripScore(trip) < tripScore(known))) byVersion.set(option.version, trip);
      }
      return { route, trips: [...byVersion.values()] };
    })
    .filter((result) => result.trips.length);

  const routes = rankRoutes(results, context).map(({ route, trips }) => describeRoute(route, trips, countryName, lang));
  return { origin, from, to, routes, failed: [...failed] };
};
