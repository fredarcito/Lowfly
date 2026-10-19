// Wizz Air public (unofficial) API. Only called from the server.
// Wizz changes the API version number with every deploy, so it is read from its home page.
import { chunks, monthEnd, monthsBetween, nightsBetween, shift } from "@/utils/dates";
import { countryName } from "@/server/countries";
import { eurRates, toEur } from "@/server/fx";
import { WEEKEND } from "@/constants/weekend";
import { fits, noTimeOff } from "@/utils/weekend";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const HEADERS = {
  "user-agent": UA,
  accept: "application/json",
  "accept-language": "es-ES,es;q=0.9",
  "content-type": "application/json",
  origin: "https://www.wizzair.com",
  referer: "https://www.wizzair.com/",
};
const FALLBACK_VERSION = "29.20.0"; // last resort; update it if it stops working
const VERSION_TTL = 6 * 3600 * 1000;

// The home page links the API as be.wizzair.com/<version>/Api. The version is kept in memory for a few hours.
// The page (~2 MB) is too big for Next's data cache, so it is not kept there, but it is asked with a revalidate,
// never no-store: a no-store request would make every page that reaches it (the route pages' photos, through the
// airports) render on each visit instead of once a day.
let version = { value: null, at: 0 };

const apiBase = async () => {
  if (!version.value || Date.now() - version.at > VERSION_TTL) {
    try {
      const response = await fetch("https://www.wizzair.com/en-gb", { headers: { "user-agent": UA }, next: { revalidate: VERSION_TTL / 1000 } });
      const match = (await response.text()).match(/be\.wizzair\.com\/([\d.]+)\/Api/);
      if (match) version = { value: match[1], at: Date.now() };
    } catch {}
  }
  return `https://be.wizzair.com/${version.value || FALLBACK_VERSION}/Api`;
};

// Wizz network: every city it flies from, with its connections
const cities = async (lang) => {
  const response = await fetch(`${await apiBase()}/asset/map?languageCode=${lang === "en" ? "en-gb" : "es-es"}`, { headers: HEADERS, next: { revalidate: 86400 } });
  if (!response.ok) throw new Error(`Wizz Air responded with error ${response.status}`);
  return (await response.json()).cities || [];
};

// Every airport Wizz flies from
export const airports = async (lang = "es") => {
  return (await cities(lang))
    .filter((city) => city.connections?.length && !city.isFakeStation)
    .map((city) => ({
      airline: "wizz",
      code: city.iata,
      name: city.shortName.trim(),
      city: city.shortName.trim(),
      country: countryName(city.countryCode, city.countryName, lang),
      countryCode: city.countryCode?.toUpperCase(),
      lat: city.latitude,
      lon: city.longitude,
    }));
};

// The real airports a city connects to. A connection can be a metropolitan area (ROM = every Rome airport): it is
// swapped for its real airports.
const connectionsOf = (city, list, byIata) => {
  const real = (connection) =>
    connection.isFakeStation ? list.filter((airport) => airport.mac === connection.iata && !airport.isFakeStation) : [connection];
  return (city.connections || [])
    .map((connection) => byIata[connection.iata])
    .filter(Boolean)
    .flatMap(real);
};

// Wizz destinations from the departure airport
export const destinations = async (origin, lang = "es") => {
  const list = await cities(lang);
  const byIata = Object.fromEntries(list.map((city) => [city.iata, city]));
  const here = byIata[origin];
  if (!here) return [];
  return connectionsOf(here, list, byIata).map((city) => ({
    airline: "wizz",
    code: city.iata,
    city: city.shortName.trim(),
    country: countryName(city.countryCode, city.countryName, lang),
  }));
};

// Every Wizz route, from every airport: [[from, to]]
export const routes = async () => {
  const list = await cities("en");
  const byIata = Object.fromEntries(list.map((city) => [city.iata, city]));
  return list
    .filter((city) => !city.isFakeStation)
    .flatMap((city) => connectionsOf(city, list, byIata).map((destination) => [city.iata, destination.iata]));
};

// Cheapest price per day on a route (in 30-day chunks)
export const daily = async (dep, arr, from, to) => {
  const base = await apiBase();
  const list = [];
  for (const [chunkStart, chunkEnd] of chunks(from, to, 30)) {
    const response = await fetch(`${base}/search/timetable`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        flightList: [{ departureStation: dep, arrivalStation: arr, from: chunkStart, to: chunkEnd }],
        priceType: "regular",
        adultCount: 1,
        childCount: 0,
        infantCount: 0,
      }),
      next: { revalidate: 600 },
    });
    if (!response.ok) throw new Error(`Wizz Air responded with error ${response.status}`);
    const data = await response.json();
    for (const flight of data.outboundFlights || []) {
      if (flight.priceType === "soldOut" || !flight.price?.amount) continue;
      const day = flight.departureDate.slice(0, 10);
      if (day < from || day > to) continue;
      // `times`: every departure that day. The price is the day's cheapest, without saying which flight.
      const times = (flight.departureDates || []).map((departure) => departure.slice(11, 16));
      list.push({ day, time: times[0] || "", times, price: flight.price.amount, cur: flight.price.currencyCode });
    }
  }
  return toEur(list);
};

// Wizz's own fare finder: the cheapest fare to every destination in a month, in a single request.
// For a return trip it is the cheapest pair within a stay bucket ("1-3 days", "4-8 days" or "anytime").
const fareFinder = async (origin, month, duration) => {
  const response = await fetch(`${await apiBase()}/search/SmartSearchCheapFlightsV2`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      departureStations: [origin],
      arrivalStations: null,
      tripDuration: duration ?? "anytime",
      isReturnFlight: !!duration,
      stdPlan: [month.slice(0, 7)],
      pax: 1,
      dateFilterType: "Flexible",
      departureDate: null,
      returnDate: null,
    }),
    next: { revalidate: 600 },
  });
  if (!response.ok) throw new Error(`Wizz Air responded with error ${response.status}`);
  return (await response.json()).items || [];
};

// Wizz's stay buckets and when each one covers part of a stay of min to max nights
// ("anytime" only when part of the stay is longer than 8 nights)
const STAY_BUCKETS = {
  "1-3 days": ({ min }) => min <= 3,
  "4-8 days": ({ min, max }) => min <= 8 && max >= 4,
  anytime: ({ max }) => max > 8,
};

// The buckets to ask for a stay of min to max nights. "1 week" is exactly 7 nights.
const buckets = (stay) => {
  if (stay.min === 7 && stay.max === 7) return ["1 week"];
  return Object.keys(STAY_BUCKETS).filter((bucket) => STAY_BUCKETS[bucket](stay));
};

// Cheapest Wizz fare (or return trip, with `stay`) to every destination between `from` and `to`.
// One fare finder request per month (and stay bucket). The finder only gives the cheapest fare of each month,
// so when that one falls outside the dates or the stay, a valid but pricier fare may exist that month.
// Those months go to `recheck` ({ code, from, to, price }), to be checked day by day, unless the destination
// already has a valid fare that is not more expensive (nothing in that month can beat it).
// With a weekend stay (lib/weekend) it uses Wizz's "weekend" bucket (Fri/Sat out, Sun/Mon back) and also checks the times.
export const cheapest = async (origin, from, to, stay = null) => {
  const lastOut = stay ? shift(to, -stay.min) : to;
  const kinds = !stay ? [null] : stay.weekend ? ["weekend"] : buckets(stay);
  const requests = monthsBetween(from, lastOut).flatMap((month) => kinds.map((bucket) => [month, bucket]));
  const pages = await Promise.all(requests.map(([month, bucket]) => fareFinder(origin, month, bucket).then((items) => ({ m: month, items }))));

  const needsRates = pages.some((page) => page.items.some((item) => item.regularPrice.currencyCode !== "EUR"));
  const fx = needsRates ? await eurRates() : { EUR: 1 };
  const eur = (price) => {
    if (!fx[price.currencyCode]) throw new Error(`No exchange rate for ${price.currencyCode}`);
    return Math.round((price.amount / fx[price.currencyCode]) * 100) / 100;
  };
  const leg = (flight) => ({ airline: "wizz", day: flight.std.slice(0, 10), time: flight.std.slice(11, 16), price: eur(flight.regularPrice) });

  const best = new Map();
  const office = new Map(); // weekend: cheapest per destination needing no time off
  const doubtful = [];
  for (const { m: month, items } of pages)
    for (const item of items) {
      const out = leg(item.outboundFlight);
      const ret = item.inboundFlight && leg(item.inboundFlight);
      const price = eur(item.regularPrice);
      const nights = ret && nightsBetween(out.day, ret.day);
      const ok =
        out.day >= from &&
        out.day <= lastOut &&
        (!stay || (ret.day <= to && nights >= stay.min && nights <= stay.max)) &&
        (!stay?.weekend || (fits(WEEKEND.out, out.day, out.time) && fits(WEEKEND.ret, ret.day, ret.time)));
      if (!ok) {
        doubtful.push({ code: item.arrivalStation, month: month, price });
        continue;
      }
      const fare = { code: item.arrivalStation, ...out, price, cur: "EUR", ...(ret && { out, ret }) };
      if (!best.has(fare.code) || price < best.get(fare.code).price) best.set(fare.code, fare);
      if (stay?.weekend && noTimeOff(fare) && (!office.has(fare.code) || price < office.get(fare.code).price))
        office.set(fare.code, fare);
    }

  const recheck = new Map();
  for (const doubt of doubtful) {
    if (best.has(doubt.code) && best.get(doubt.code).price <= doubt.price) continue;
    const monthStart = doubt.month > from ? doubt.month : from;
    const monthStop = monthEnd(doubt.month) < lastOut ? monthEnd(doubt.month) : lastOut;
    const key = `${doubt.code} ${monthStart}`;
    if (!recheck.has(key) || doubt.price < recheck.get(key).price) recheck.set(key, { code: doubt.code, from: monthStart, to: monthStop, price: doubt.price });
  }
  return { fares: [...new Set([...best.values(), ...office.values()])], recheck: [...recheck.values()] };
};
