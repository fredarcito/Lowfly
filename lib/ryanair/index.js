// Ryanair public (unofficial) API. Only called from the server.
import { monthsBetween } from "@/lib/dates";
import { countryName } from "@/lib/countries";

const BASE = "https://www.ryanair.com/api/farfnd/v4";
// API market and language: they decide which language city and country names come in
const MARKET = { es: { market: "es-es", language: "es" }, en: { market: "en-gb", language: "en" } };
const HEADERS = {
  accept: "application/json",
  "accept-language": "es-ES,es;q=0.9",
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
};

async function get(path, params) {
  const r = await fetch(`${BASE}/${path}?${new URLSearchParams(params)}`, {
    headers: HEADERS,
    next: { revalidate: 600 }, // 10 min cache per route and date
  });
  if (!r.ok) throw new Error(`Ryanair responded with error ${r.status}`);
  return r.json();
}

// Cheapest fare to every destination within the range (a single request)
export async function cheapest(origin, from, to, lang = "es") {
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
}

// Cheapest price per day on a route
export async function daily(dep, arr, from, to) {
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
}

// Cheapest return trip to every destination: both flights within [from, to], staying minN to maxN nights
export async function roundTrip(origin, from, to, minN, maxN, lang = "es") {
  const data = await get("roundTripFares", {
    departureAirportIataCode: origin,
    outboundDepartureDateFrom: from,
    outboundDepartureDateTo: to,
    inboundDepartureDateFrom: from,
    inboundDepartureDateTo: to,
    durationFrom: minN,
    durationTo: maxN,
    currency: "EUR",
    ...MARKET[lang],
    adultPaxCount: 1,
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
}
