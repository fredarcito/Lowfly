// Ryanair public (unofficial) API. Only called from the server.
import { chunks, monthsBetween, shift } from "@/utils/dates";
import { countryName } from "@/server/countries";
import { WEEKEND } from "@/constants/weekend";
import { noTimeOff } from "@/utils/weekend";
import { airlineJson, fetchCacheOptions, responseError } from "@/server/airlineGuard";

const BASE = "https://www.ryanair.com/api/farfnd/v4";
// API market and language: they decide which language city and country names come in
const MARKET = { es: { market: "es-es", language: "es" }, en: { market: "en-gb", language: "en" } };
const HEADERS = {
  accept: "application/json",
  "accept-language": "es-ES,es;q=0.9",
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
};

// Searches: an answer is used for an hour and kept 12 hours (served when Ryanair fails or blocks us); at most 6
// requests a second between every visitor
const GUARD = { fresh: 3600, keep: 12 * 3600, perSecond: 6 };

// A search, through server/airlineGuard so Ryanair does not block us
const get = (path, params) => {
  const query = new URLSearchParams(params);
  query.sort();
  return airlineJson(
    "ryanair",
    `${path}?${query}`,
    async () => {
      const response = await fetch(`${BASE}/${path}?${query}`, { headers: HEADERS, ...fetchCacheOptions(600) });
      if (!response.ok) throw responseError("Ryanair", response);
      return response.json();
    },
    GUARD
  );
};

// Every active Ryanair airport (city, country, coordinates and the country's main airport)
export const airports = async (lang = "es") => {
  const response = await fetch(`https://www.ryanair.com/api/views/locate/5/airports/${lang}/active`, {
    headers: HEADERS,
    next: { revalidate: 86400 },
  });
  if (!response.ok) throw new Error(`Ryanair responded with error ${response.status}`);
  return (await response.json()).map((airport) => ({
    airline: "ryanair",
    code: airport.code,
    name: airport.name,
    city: airport.city?.name || airport.name,
    country: countryName(airport.country.code, airport.country.name, lang),
    countryCode: airport.country.code.toUpperCase(),
    main: airport.country.defaultAirportCode === airport.code,
    tz: airport.timeZone,
    lat: airport.coordinates?.latitude,
    lon: airport.coordinates?.longitude,
  }));
};

// Every Ryanair route, from every airport, in a single request: [[from, to]]. A route another airline operates
// ("airport:MLA|Air Malta") is left out: it is not Ryanair's to sell.
export const routes = async () => {
  const response = await fetch("https://www.ryanair.com/api/views/locate/3/aggregate/all/en", {
    headers: HEADERS,
    next: { revalidate: 86400 },
  });
  if (!response.ok) throw new Error(`Ryanair responded with error ${response.status}`);
  return (await response.json()).airports.flatMap((airport) =>
    airport.routes
      .filter((route) => /^airport:[A-Z]{3}$/.test(route))
      .map((route) => [airport.iataCode, route.slice("airport:".length)])
  );
};

// Cheapest fare to every destination within the range (a single request)
export const cheapest = async (origin, from, to, lang = "es") => {
  const data = await get("oneWayFares", {
    departureAirportIataCode: origin,
    outboundDepartureDateFrom: from,
    outboundDepartureDateTo: to,
    currency: "EUR",
    ...MARKET[lang],
    adultPaxCount: 1,
  });
  return (data.fares || []).map((fare) => {
    const outbound = fare.outbound;
    const airport = outbound.arrivalAirport;
    return {
      airline: "ryanair",
      code: airport.iataCode,
      city: airport.city?.name || airport.name,
      country: countryName(airport.city?.countryCode || airport.countryCode, airport.countryName, lang),
      day: outbound.departureDate.slice(0, 10),
      time: outbound.departureDate.slice(11, 16),
      arrive: outbound.arrivalDate?.slice(11, 16),
      price: outbound.price.value,
      cur: outbound.price.currencyCode,
    };
  });
};

// Cheapest price per day on a route
export const daily = async (dep, arr, from, to) => {
  const list = [];
  for (const month of monthsBetween(from, to)) {
    const data = await get(`oneWayFares/${dep}/${arr}/cheapestPerDay`, { outboundMonthOfDate: month, currency: "EUR" });
    for (const fare of data.outbound?.fares || []) {
      if (!fare.price || fare.unavailable || fare.soldOut || fare.day < from || fare.day > to) continue;
      list.push({
        day: fare.day,
        time: (fare.departureDate || "").slice(11, 16),
        arrive: fare.arrivalDate?.slice(11, 16),
        price: fare.price.value,
        cur: fare.price.currencyCode,
      });
    }
  }
  return list;
};

// Cheapest return trip to every destination: both flights within [from, to], staying minN to maxN nights.
// The longer the range, the fewer destinations Ryanair returns (from BUD: 22 for 30 days, 53 for three
// 10-day windows), so the outbound dates are searched in 10-day windows, 6 at a time,
// and the cheapest per destination is kept.
export const roundTrip = async (origin, from, to, minN, maxN, lang = "es") => {
  const windows = chunks(from, shift(to, -minN), 10);
  const fares = [];
  for (let start = 0; start < windows.length; start += 6) {
    const batch = windows.slice(start, start + 6).map(([windowStart, windowEnd]) =>
      roundTripWindow(origin, windowStart, windowEnd, shift(windowStart, minN), shift(windowEnd, maxN) < to ? shift(windowEnd, maxN) : to, minN, maxN, lang)
    );
    fares.push(...(await Promise.all(batch)).flat());
  }
  const best = new Map();
  for (const fare of fares) if (!best.has(fare.code) || fare.price < best.get(fare.code).price) best.set(fare.code, fare);
  return [...best.values()];
};

// Cheapest weekend trip (see lib/weekend) to every destination between `from` and `to`.
// Ryanair filters by weekday and time itself; one request per outbound/return slot pair and 10-day window.
// Returns up to two trips per destination: the cheapest, and the cheapest needing no time off.
export const weekendTrips = async (origin, from, to, lang = "es") => {
  const jobs = [];
  for (const [windowStart, windowEnd] of chunks(from, to, 10))
    for (const outSlot of WEEKEND.out)
      for (const retSlot of WEEKEND.ret)
        jobs.push(() =>
          roundTripWindow(origin, windowStart, windowEnd, shift(windowStart, 1), shift(windowEnd, 3) < to ? shift(windowEnd, 3) : to, 1, 3, lang, {
            outboundDepartureDaysOfWeek: outSlot.name,
            outboundDepartureTimeFrom: outSlot.from,
            outboundDepartureTimeTo: outSlot.to,
            inboundDepartureDaysOfWeek: retSlot.name,
            inboundDepartureTimeFrom: retSlot.from,
            inboundDepartureTimeTo: retSlot.to,
          })
        );
  const fares = [];
  for (let start = 0; start < jobs.length; start += 6) fares.push(...(await Promise.all(jobs.slice(start, start + 6).map((job) => job()))).flat());
  // Per destination, the cheapest and the cheapest needing no time off (both, when they differ)
  const best = new Map();
  for (const fare of fares)
    for (const key of noTimeOff(fare) ? [fare.code, `${fare.code} office`] : [fare.code])
      if (!best.has(key) || fare.price < best.get(key).price) best.set(key, fare);
  return [...new Set(best.values())];
};

const roundTripWindow = async (origin, outFrom, outTo, inFrom, inTo, minN, maxN, lang, filters = {}) => {
  const data = await get("roundTripFares", {
    departureAirportIataCode: origin,
    outboundDepartureDateFrom: outFrom,
    outboundDepartureDateTo: outTo,
    inboundDepartureDateFrom: inFrom,
    inboundDepartureDateTo: inTo,
    durationFrom: minN,
    durationTo: maxN,
    currency: "EUR",
    ...MARKET[lang],
    adultPaxCount: 1,
    ...filters,
  });
  const leg = (flight) => ({
    airline: "ryanair",
    day: flight.departureDate.slice(0, 10),
    time: flight.departureDate.slice(11, 16),
    arrive: flight.arrivalDate?.slice(11, 16),
    price: flight.price.value,
  });
  return (data.fares || []).map((fare) => {
    const airport = fare.outbound.arrivalAirport;
    return {
      code: airport.iataCode,
      city: airport.city?.name || airport.name,
      country: countryName(airport.city?.countryCode || airport.countryCode, airport.countryName, lang),
      out: leg(fare.outbound),
      ret: leg(fare.inbound),
      price: fare.summary.price.value,
      cur: fare.summary.price.currencyCode,
    };
  });
};
