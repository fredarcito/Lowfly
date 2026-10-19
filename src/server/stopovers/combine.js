// Joins the flights of a trip's legs into the cheapest whole trips. Knows nothing about hubs or airlines, so the same
// code joins a stopover (2 legs), its return (3–4) or, later, a multi-city trip (docs/stopovers.md).
import { nightsBetween } from "@/utils/dates";

const cents = (price) => Math.round(price * 100) / 100;

// legs: the flights of each leg in order ([[{ day, price, … }], …]); stops: the nights allowed between leg i and
// leg i + 1 ([{ min, max }], one fewer than legs); canFollow(previous, next, nights, stop): any other rule (the same
// airport, time to connect…), `stop` being the index of the stop between them. For each flight of the first leg,
// the cheapest whole trip starting with it: [{ price, legs: [flights] }] (flights of the first leg with no way to
// finish are left out).
export const combineLegs = (legs, stops, canFollow = () => true) => {
  // From the last leg back: the cheapest way to finish the trip from each flight
  let rest = legs.at(-1).map((flight) => ({ price: flight.price, legs: [flight] }));
  for (let index = legs.length - 2; index >= 0; index--) {
    const stop = stops[index];
    const following = rest.filter(Boolean);
    rest = legs[index].map((flight) => {
      let best = null;
      for (const option of following) {
        const next = option.legs[0];
        const nights = nightsBetween(flight.day, next.day);
        if (nights < stop.min || nights > stop.max) continue;
        if ((!best || option.price < best.price) && canFollow(flight, next, nights, index)) best = option;
      }
      return best && { price: cents(flight.price + best.price), legs: [flight, ...best.legs] };
    });
  }
  return rest.filter(Boolean);
};
