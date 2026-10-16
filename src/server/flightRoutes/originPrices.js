// The cheapest one-way flight of the next three months from an origin to each of its destination cities, for the
// origin's page (/es/flights/malta): { [route slug]: price in euros }. From the airlines' fare finders (a few
// seconds), read again with the page at most once a day.
import { cheapestByDestination } from "@/server/flights";
import { shift, tomorrow } from "@/utils/dates";

const AHEAD = 90;

export const originPrices = async (origin, routes, lang = "es") => {
  const from = tomorrow();
  const byAirport = await cheapestByDestination(origin, from, shift(from, AHEAD), lang);
  return Object.fromEntries(
    routes
      .map((route) => [route.slug, Math.min(...route.airports.map((airport) => byAirport[airport.code] ?? Infinity))])
      .filter(([, price]) => Number.isFinite(price))
  );
};
