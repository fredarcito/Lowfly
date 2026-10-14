// Ryanair public (unofficial) API. Only called from the server.
import { chunks, monthsBetween, shift } from "@/utils/dates";
import { countryName } from "@/server/countries";
import { WEEKEND } from "@/constants/weekend";
import { noTimeOff } from "@/utils/weekend";

const BASE = "https://www.ryanair.com/api/farfnd/v4";
// API market and language: they decide which language city and country names come in
const MARKET = { es: { market: "es-es", language: "es" }, en: { market: "en-gb", language: "en" } };
const HEADERS = {
  accept: "application/json",
  "accept-language": "es-ES,es;q=0.9",
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
};

const get = async (path, params) => {
  const r = await fetch(`${BASE}/${path}?${new URLSearchParams(params)}`, {
    headers: HEADERS,
    next: { revalidate: 600 }, // 10 min cache per route and date
  });
  if (!r.ok) throw new Error(`Ryanair responded with error ${r.status}`);
  return r.json();
};

// Every active Ryanair airport (city, country, coordinates and the country's main airport)
export const airports = async (lang = "es") => {
  const r = await fetch(`https://www.ryanair.com/api/views/locate/5/airports/${lang}/active`, {
    headers: HEADERS,
    next: { revalidate: 86400 },
  });
  if (!r.ok) throw new Error(`Ryanair responded with error ${r.status}`);
  return (await r.json()).map((a) => ({
    airline: "ryanair",
    code: a.code,
    name: a.name,
    city: a.city?.name || a.name,
    country: countryName(a.country.code, a.country.name, lang),
    countryCode: a.country.code.toUpperCase(),
    main: a.country.defaultAirportCode === a.code,
    tz: a.timeZone,
    lat: a.coordinates?.latitude,
    lon: a.coordinates?.longitude,
  }));
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
  return (data.fares || []).map((f) => {
    const o = f.outbound;
    const a = o.arrivalAirport;
    return {
      airline: "ryanair",
      code: a.iataCode,
      city: a.city?.name || a.name,
      country: countryName(a.city?.countryCode || a.countryCode, a.countryName, lang),
      day: o.departureDate.slice(0, 10),
      time: o.departureDate.slice(11, 16),
      arrive: o.arrivalDate?.slice(11, 16),
      price: o.price.value,
      cur: o.price.currencyCode,
    };
  });
};

// Cheapest price per day on a route
export const daily = async (dep, arr, from, to) => {
  const list = [];
  for (const month of monthsBetween(from, to)) {
    const d = await get(`oneWayFares/${dep}/${arr}/cheapestPerDay`, { outboundMonthOfDate: month, currency: "EUR" });
    for (const f of d.outbound?.fares || []) {
      if (!f.price || f.unavailable || f.soldOut || f.day < from || f.day > to) continue;
      list.push({
        day: f.day,
        time: (f.departureDate || "").slice(11, 16),
        arrive: f.arrivalDate?.slice(11, 16),
        price: f.price.value,
        cur: f.price.currencyCode,
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
  for (let i = 0; i < windows.length; i += 6) {
    const batch = windows.slice(i, i + 6).map(([a, b]) =>
      roundTripWindow(origin, a, b, shift(a, minN), shift(b, maxN) < to ? shift(b, maxN) : to, minN, maxN, lang)
    );
    fares.push(...(await Promise.all(batch)).flat());
  }
  const best = new Map();
  for (const f of fares) if (!best.has(f.code) || f.price < best.get(f.code).price) best.set(f.code, f);
  return [...best.values()];
};

// Cheapest weekend trip (see lib/weekend) to every destination between `from` and `to`.
// Ryanair filters by weekday and time itself; one request per outbound/return slot pair and 10-day window.
// Returns up to two trips per destination: the cheapest, and the cheapest needing no time off.
export const weekendTrips = async (origin, from, to, lang = "es") => {
  const jobs = [];
  for (const [a, b] of chunks(from, to, 10))
    for (const o of WEEKEND.out)
      for (const r of WEEKEND.ret)
        jobs.push(() =>
          roundTripWindow(origin, a, b, shift(a, 1), shift(b, 3) < to ? shift(b, 3) : to, 1, 3, lang, {
            outboundDepartureDaysOfWeek: o.name,
            outboundDepartureTimeFrom: o.from,
            outboundDepartureTimeTo: o.to,
            inboundDepartureDaysOfWeek: r.name,
            inboundDepartureTimeFrom: r.from,
            inboundDepartureTimeTo: r.to,
          })
        );
  const fares = [];
  for (let i = 0; i < jobs.length; i += 6) fares.push(...(await Promise.all(jobs.slice(i, i + 6).map((j) => j()))).flat());
  // Per destination, the cheapest and the cheapest needing no time off (both, when they differ)
  const best = new Map();
  for (const f of fares)
    for (const key of noTimeOff(f) ? [f.code, `${f.code} office`] : [f.code])
      if (!best.has(key) || f.price < best.get(key).price) best.set(key, f);
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
  const leg = (l) => ({
    airline: "ryanair",
    day: l.departureDate.slice(0, 10),
    time: l.departureDate.slice(11, 16),
    arrive: l.arrivalDate?.slice(11, 16),
    price: l.price.value,
  });
  return (data.fares || []).map((f) => {
    const a = f.outbound.arrivalAirport;
    return {
      code: a.iataCode,
      city: a.city?.name || a.name,
      country: countryName(a.city?.countryCode || a.countryCode, a.countryName, lang),
      out: leg(f.outbound),
      ret: leg(f.inbound),
      price: f.summary.price.value,
      cur: f.summary.price.currencyCode,
    };
  });
};
