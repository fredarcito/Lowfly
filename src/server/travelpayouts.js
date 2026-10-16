// More airlines (constants/airlines: easyJet, Vueling…) through Travelpayouts' flight data API. Only called from
// the server: the token never reaches the browser. Its prices are the ones seen in recent searches (not live): the
// fares carry `cached`, and the airline's own site confirms them. Only direct flights of those airlines, sold by
// the airline itself and seen in the last days, to and from airports we know (server/airports: names, countries,
// time zones).
// Without TRAVELPAYOUTS_TOKEN, or when it fails, nothing is added: the live airlines are enough.
import { getAirports } from "@/server/airports";
import { MORE_AIRLINES, airlineOfCode } from "@/constants/airlines";
import { monthsBetween, nightsBetween, shift } from "@/utils/dates";

const ENDPOINT = "https://api.travelpayouts.com/aviasales/v3/prices_for_dates";
// Prices change little within the hour; every server instance shares Next's data cache
const REVALIDATE = 3600;
// Prices older than this (days since they were seen) are left out
const FRESH_DAYS = 5;
// How far ahead the destinations are looked for (days)
const DESTINATION_DAYS = 180;

export const hasMoreAirlines = () => Boolean(process.env.TRAVELPAYOUTS_TOKEN);

// The direct flights of our airlines in `month` ("2026-11") from `origin` (to `destination`, or anywhere); `oneWay`
// false: return trips (with return_at)
const search = async ({ origin, destination, month, oneWay = true }) => {
  const params = new URLSearchParams({ origin, departure_at: month, currency: "eur", sorting: "price", direct: "true", one_way: String(oneWay), limit: "1000" });
  if (destination) params.set("destination", destination);
  const response = await fetch(`${ENDPOINT}?${params}`, {
    headers: { "X-Access-Token": process.env.TRAVELPAYOUTS_TOKEN },
    next: { revalidate: REVALIDATE },
  });
  if (!response.ok) throw new Error(`Travelpayouts responded with error ${response.status}`);
  const { data } = await response.json();
  return (data || []).filter(
    (flight) =>
      airlineOfCode[flight.airline] &&
      !flight.transfers &&
      !flight.return_transfers &&
      flight.price > 0 &&
      flight.origin_airport === origin &&
      soldByAirline(flight) &&
      daysSinceSeen(flight) <= FRESH_DAYS
  );
};

// Sold by the airline itself (`gate`, the seller, is the airline): its own price, and both flights of a return
// trip with it. An agency's price has its fees and may join two airlines while naming only the outbound's
// (a Malta → Amsterdam "easyJet" trip back with KM Malta Airlines, 200 € against easyJet's 115 €).
const soldByAirline = (flight) => {
  const seller = String(flight.gate ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const airline = MORE_AIRLINES[airlineOfCode[flight.airline]].name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return seller.includes(airline);
};

// Days since the price was seen: its search's date (ddmmyyyy) is in the link Travelpayouts gives
const daysSinceSeen = (flight) => {
  const seen = /[?&]search_date=(\d{2})(\d{2})(\d{4})/.exec(flight.link ?? "");
  if (!seen) return Infinity;
  return (Date.now() - Date.UTC(Number(seen[3]), Number(seen[2]) - 1, Number(seen[1]))) / 86_400_000;
};

// "HH:MM" at `zone` of the instant `minutes` after `departure` (an ISO time with its offset), or undefined
const arrivalAt = (departure, minutes, zone) => {
  if (!minutes || !zone) return undefined;
  const instant = new Date(new Date(departure).getTime() + minutes * 60_000);
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: zone }).format(instant);
};

// A flight as the rest of the search has them: { day, time, arrive, price, cur, airline, cached }
const leg = (departure, minutes, zone, airline, price) => ({
  day: departure.slice(0, 10),
  time: departure.slice(11, 16),
  arrive: arrivalAt(departure, minutes, zone),
  price,
  cur: "EUR",
  airline,
  cached: true,
});

const knownAirports = async (lang) => new Map((await getAirports(lang)).airports.map((airport) => [airport.code, airport]));

// The destinations our airlines fly to directly from `origin` (seen in recent searches over the next months):
// [{ code, city, country, airline }], one per airline and airport
export const destinations = async (origin, from, lang = "es") => {
  if (!hasMoreAirlines()) return [];
  const months = monthsBetween(from, shift(from, DESTINATION_DAYS));
  const [airports, ...found] = await Promise.all([knownAirports(lang), ...months.map((month) => search({ origin, month: month.slice(0, 7) }))]);
  const byKey = new Map();
  for (const flight of found.flat()) {
    const airport = airports.get(flight.destination_airport);
    if (!airport) continue;
    const airline = airlineOfCode[flight.airline];
    byKey.set(`${airport.code}|${airline}`, { code: airport.code, city: airport.city, country: airport.country, airline });
  }
  return [...byKey.values()];
};

// The cheapest flight per day from `dep` to `arr` between `from` and `to` with `airline` (constants/airlines id),
// like the live airlines' `daily`
export const daily = async (dep, arr, from, to, airline, lang = "es") => {
  if (!hasMoreAirlines()) return [];
  const [airports, ...found] = await Promise.all([knownAirports(lang), ...monthsBetween(from, to).map((month) => search({ origin: dep, destination: arr, month: month.slice(0, 7) }))]);
  const zone = airports.get(arr)?.tz;
  const byDay = new Map();
  for (const flight of found.flat()) {
    if (airlineOfCode[flight.airline] !== airline || flight.destination_airport !== arr) continue;
    const fare = leg(flight.departure_at, flight.duration_to ?? flight.duration, zone, airline, flight.price);
    if (fare.day < from || fare.day > to) continue;
    if (!byDay.has(fare.day) || fare.price < byDay.get(fare.day).price) byDay.set(fare.day, fare);
  }
  return [...byDay.values()];
};

// The cheapest one-way flight to each destination between `from` and `to`: fares like the live airlines' cheapest
export const cheapest = async (origin, from, to, lang = "es") => {
  if (!hasMoreAirlines()) return [];
  const [airports, ...found] = await Promise.all([knownAirports(lang), ...monthsBetween(from, to).map((month) => search({ origin, month: month.slice(0, 7) }))]);
  const byCode = new Map();
  for (const flight of found.flat()) {
    const airport = airports.get(flight.destination_airport);
    if (!airport) continue;
    const fare = { ...leg(flight.departure_at, flight.duration_to ?? flight.duration, airport.tz, airlineOfCode[flight.airline], flight.price), code: airport.code, city: airport.city, country: airport.country };
    if (fare.day < from || fare.day > to) continue;
    if (!byCode.has(fare.code) || fare.price < byCode.get(fare.code).price) byCode.set(fare.code, fare);
  }
  return [...byCode.values()];
};

// The cheapest return trip to each destination, leaving between `from` and `to`, staying stay.min to stay.max
// nights (`accept(out, ret)`: any other rule, the weekend slots): [{ dest, out, ret, price }]. The data gives the
// trip's total only, so each flight has no price of its own.
export const roundTrips = async (origin, from, to, stay, accept = () => true, lang = "es") => {
  if (!hasMoreAirlines()) return [];
  const [airports, ...found] = await Promise.all([
    knownAirports(lang),
    ...monthsBetween(from, to).map((month) => search({ origin, month: month.slice(0, 7), oneWay: false })),
  ]);
  const zoneHome = airports.get(origin)?.tz;
  const byCode = new Map();
  for (const flight of found.flat()) {
    const airport = airports.get(flight.destination_airport);
    if (!airport || !flight.return_at) continue;
    const airline = airlineOfCode[flight.airline];
    const out = leg(flight.departure_at, flight.duration_to, airport.tz, airline, null);
    const ret = leg(flight.return_at, flight.duration_back, zoneHome, airline, null);
    const nights = nightsBetween(out.day, ret.day);
    if (out.day < from || ret.day > to || nights < stay.min || nights > stay.max || !accept(out, ret)) continue;
    if (!byCode.has(airport.code) || flight.price < byCode.get(airport.code).price) byCode.set(airport.code, { dest: airport, out, ret, price: flight.price });
  }
  return [...byCode.values()];
};
