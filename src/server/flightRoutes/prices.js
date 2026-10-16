// What a route's page says about its prices: the cheapest flight of each of the next months, the cheapest overall,
// which month and weekday are cheapest, its airlines and how long the flight takes. From the live airlines' price
// per day (server/flights), so the page is read again at most once a day (the page's revalidate).
import { cheapestPerDay } from "@/server/flights";
import { flightMinutes } from "@/utils/flightTime";
import { shift, tomorrow } from "@/utils/dates";

// How far ahead (days): six months
const AHEAD = 180;

// route: server/flightRoutes/routes. { months: [{ month: "2026-11", fare }], cheapest, cheapestMonth,
// cheapestWeekday (0 = Monday), airlines, minutes } — fare: { day, time, arrive, price, cur, airline, code }
export const routePrices = async (route) => {
  const from = tomorrow();
  const fares = (await cheapestPerDay(route.origin.code, route.airports, from, shift(from, AHEAD))).filter((fare) => fare.cur === "EUR");
  if (!fares.length) return null;
  const cheaper = (first, second) => (!first || second.price < first.price ? second : first);

  const byMonth = new Map();
  for (const fare of fares) byMonth.set(fare.day.slice(0, 7), cheaper(byMonth.get(fare.day.slice(0, 7)), fare));
  const months = [...byMonth.entries()].sort().map(([month, fare]) => ({ month, fare }));

  // The weekday whose flights cost least on average
  const weekdays = Array.from({ length: 7 }, () => ({ total: 0, count: 0 }));
  for (const fare of fares) {
    const weekday = (new Date(`${fare.day}T12:00:00Z`).getUTCDay() + 6) % 7;
    weekdays[weekday].total += fare.price;
    weekdays[weekday].count += 1;
  }
  const averages = weekdays.map((weekday) => (weekday.count ? weekday.total / weekday.count : Infinity));

  const zoneOf = new Map(route.airports.map((airport) => [airport.code, airport.tz]));
  const lengths = fares.map((fare) => flightMinutes(fare, route.origin.tz, zoneOf.get(fare.code))).filter(Boolean).sort((first, second) => first - second);

  const cheapest = fares.reduce(cheaper, null);
  return {
    months,
    cheapest,
    cheapestMonth: months.reduce((best, entry) => (!best || entry.fare.price < best.fare.price ? entry : best), null).month,
    cheapestWeekday: averages.indexOf(Math.min(...averages)),
    airlines: [...new Set(fares.map((fare) => fare.airline))],
    // The usual length: the middle one
    minutes: lengths.length ? lengths[Math.floor(lengths.length / 2)] : null,
  };
};
