// The route pages' prices: the cheapest flight of each of the next months, which month is cheapest, the airlines
// and how long the flight takes. The cron (server/flightRoutes/refresh) asks once a day for a whole airport: the
// airlines' fare finders give, in one request per airline and month, the cheapest fare to every destination
// (Ryanair, Wizz Air, and the others' recent searches through Travelpayouts), so ~20 requests cover all of an
// airport's routes. The pages read what it saved (server/flightRoutes/snapshots). Only called from the server.
import * as ryanair from "@/server/ryanair";
import * as wizz from "@/server/wizz";
import * as more from "@/server/travelpayouts";
import { readOrigin } from "@/server/flightRoutes/snapshots";
import { flightMinutes } from "@/utils/flightTime";
import { monthEnd, monthsBetween, shift, today, tomorrow } from "@/utils/dates";

// How far ahead (days): six months
const AHEAD = 180;
// The airport's page shows each destination's cheapest flight of the next three months
const ORIGIN_PAGE_DAYS = 90;

const cheaper = (first, second) => (!first || second.price < first.price ? second : first);

// What a page needs of a fare
const trimmed = ({ day, time, arrive, price, airline, code }) => ({ day, time, arrive: arrive ?? null, price, airline, code });

// The cheapest fare of every airline to every destination from `origin`, month by month over the next six months:
// { months: [{ month: "2026-11", fares }], failed: ["ryanair"] }. `failed`: the live airlines that did not answer
// some month (Travelpayouts only adds, so its failures are not told).
export const originMonths = async (origin) => {
  const from = tomorrow();
  const last = shift(from, AHEAD);
  const failed = new Set();
  const months = await Promise.all(
    monthsBetween(from, last).map(async (month) => {
      const start = month < from ? from : month;
      const end = monthEnd(month) < last ? monthEnd(month) : last;
      const [ryanairFares, wizzFares, otherFares] = await Promise.allSettled([
        ryanair.cheapest(origin, start, end, "en"),
        wizz.cheapest(origin, start, end),
        more.cheapest(origin, start, end, "en"),
      ]);
      if (ryanairFares.status === "rejected") failed.add("ryanair");
      if (wizzFares.status === "rejected") failed.add("wizz");
      const fares = [...(ryanairFares.value ?? []), ...(wizzFares.value?.fares ?? []), ...(otherFares.value ?? [])];
      return { month: month.slice(0, 7), fares: fares.filter((fare) => fare.cur === "EUR" && fare.price > 0).map(trimmed) };
    })
  );
  return { months, failed: [...failed] };
};

// One route's prices, from its airport's months (originMonths): { months: [{ month, fare }], airlines, minutes },
// or null when no airline has a fare. route: server/flightRoutes/routes.
export const routeMonths = (route, months) => {
  const codes = new Set(route.airports.map((airport) => airport.code));
  const fares = months.flatMap(({ month, fares: monthFares }) => monthFares.filter((fare) => codes.has(fare.code)).map((fare) => ({ month, fare })));
  if (!fares.length) return null;
  const byMonth = new Map();
  for (const { month, fare } of fares) byMonth.set(month, cheaper(byMonth.get(month), fare));
  const zoneOf = new Map(route.airports.map((airport) => [airport.code, airport.tz]));
  const lengths = fares
    .map(({ fare }) => flightMinutes(fare, route.origin.tz, zoneOf.get(fare.code)))
    .filter(Boolean)
    .sort((first, second) => first - second);
  return {
    months: [...byMonth.entries()].sort().map(([month, fare]) => ({ month, fare })),
    airlines: [...new Set(fares.map(({ fare }) => fare.airline))],
    // The usual length: the middle one
    minutes: lengths.length ? lengths[Math.floor(lengths.length / 2)] : null,
  };
};

// The months still to come of what was saved (it may be a day or two old)
const comingMonths = (saved) => saved?.months.filter((entry) => entry.month >= today().slice(0, 7)) ?? [];

// What a route's page says about its prices: { months, cheapest, cheapestMonth, airlines, minutes }, or null
// (none now). fare: { day, time, arrive, price, airline, code }
export const routePrices = async (route, lang) => {
  const saved = (await readOrigin(route.origin.code, lang))?.prices[route.slug];
  const months = comingMonths(saved);
  if (!months.length) return null;
  const best = months.reduce((cheapestSoFar, entry) => (!cheapestSoFar || entry.fare.price < cheapestSoFar.fare.price ? entry : cheapestSoFar), null);
  return { months, cheapest: best.fare, cheapestMonth: best.month, airlines: saved.airlines, minutes: saved.minutes };
};

// The cheapest flight of the next three months to each of an airport's destination cities, for its page
// (/es/flights/malta): { [route slug]: price in euros }. By whole months: a month that starts within the three
// months counts.
export const originPrices = async (origin, lang) => {
  const last = shift(today(), ORIGIN_PAGE_DAYS).slice(0, 7);
  const prices = (await readOrigin(origin, lang))?.prices ?? {};
  return Object.fromEntries(
    Object.entries(prices)
      .map(([slug, saved]) => [slug, Math.min(...comingMonths(saved).filter((entry) => entry.month <= last).map((entry) => entry.fare.price))])
      .filter(([, price]) => Number.isFinite(price))
  );
};
