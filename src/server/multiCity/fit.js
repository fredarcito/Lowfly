// How a multi-city route fits the dates someone is free (docs/multi-city.md, 1b and 4): which versions fit, how many
// nights each town gets, and the dates a seasonal route can be done. Pure: no requests.
import { nightsBetween } from "@/utils/dates";
import { MAX_FREE_NIGHTS, MIN_FREE_NIGHTS } from "@/constants/multiCity";

// The free dates, in nights (constants/multiCity)
export const MIN_WINDOW_NIGHTS = MIN_FREE_NIGHTS;
export const MAX_WINDOW_NIGHTS = MAX_FREE_NIGHTS;
// A version lasts at most this many nights more, or fewer, than its towns' ideal ones (and never under their minimum):
// squeezed further, a long version would be the full one with more towns in a rush
const IDEAL_SLACK = 2;

const sum = (stops, key) => stops.reduce((total, stop) => total + stop.nights[key], 0);

// The nights a version can last within `windowNights` ({ min, max }), or null when it does not fit
export const stayRange = (stops, windowNights) => {
  const ideal = sum(stops, "ideal");
  const min = Math.max(sum(stops, "min"), ideal - IDEAL_SLACK);
  if (min > windowNights) return null;
  return { min, max: Math.max(min, Math.min(ideal + IDEAL_SLACK, windowNights)) };
};

// The nights of a version's ideal stay
export const idealNights = (stops) => sum(stops, "ideal");

// `nights` shared out over the stops: each its minimum, then one at a time to the town furthest below its ideal
// (past every ideal, to the towns with the most ideal nights). A town with no ideal nights (passed through, the end
// of a loop) gets none. [nights per stop], or null when `nights` is under the minimum.
export const shareNights = (stops, nights) => {
  const shared = stops.map((stop) => stop.nights.min);
  let spare = nights - shared.reduce((total, count) => total + count, 0);
  if (spare < 0) return null;
  const staying = stops.map((stop, index) => index).filter((index) => stops[index].nights.ideal > 0);
  if (!staying.length) return shared;
  while (spare > 0) {
    const next = staying.reduce((best, index) => {
      const missing = stops[index].nights.ideal - shared[index];
      const bestMissing = stops[best].nights.ideal - shared[best];
      if (missing !== bestMissing) return missing > bestMissing ? index : best;
      return stops[index].nights.ideal > stops[best].nights.ideal ? index : best;
    });
    shared[next]++;
    spare--;
  }
  return shared;
};

// The part of the free dates within a seasonal route's days (`season`: { from: "MM-DD", to: "MM-DD" }, `to` before
// `from` crossing the new year): { from, to }, or null when they do not meet. A route with no season: the dates.
export const seasonWindow = (route, from, to) => {
  if (!route.season) return { from, to };
  const year = Number(from.slice(0, 4));
  const crossesYear = route.season.to < route.season.from;
  // This year's season and, crossing the new year, last year's (free dates in early January)
  for (const startYear of crossesYear ? [year - 1, year] : [year]) {
    const start = `${startYear}-${route.season.from}`;
    const end = `${crossesYear ? startYear + 1 : startYear}-${route.season.to}`;
    const clipped = { from: from > start ? from : start, to: to < end ? to : end };
    if (clipped.from <= clipped.to) return clipped;
  }
  return null;
};

// Nights between two days, never negative
export const nightsWithin = (window) => Math.max(0, nightsBetween(window.from, window.to));
