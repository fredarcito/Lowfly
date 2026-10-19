import { BAGS } from "@/constants/baggage";

// What a bag of `kind` (cabin | checked) adds to the fare, on every flight of it (an estimate: "from"; a trip
// through a hub: its `legs`).
// null when it cannot be estimated (an airline without a known fee, or a price not in euros).
export const bagExtra = (fare, kind) => {
  if ((fare.cur ?? "EUR") !== "EUR") return null;
  const flights = fare.legs ?? (fare.ret ? [fare.out, fare.ret] : [fare]);
  const bags = flights.map((flight) => BAGS[kind].from[flight?.airline]);
  if (bags.some((bag) => bag == null)) return null;
  return bags.reduce((total, bag) => total + bag, 0);
};

// The cheapest bag's extra for a fare ("from +€12"), or null
export const cheapestBagExtra = (fare) => {
  const extras = Object.keys(BAGS)
    .map((kind) => bagExtra(fare, kind))
    .filter((extra) => extra != null);
  return extras.length ? Math.min(...extras) : null;
};
