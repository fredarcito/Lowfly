"use client";

import { useState } from "react";

// A trip through a hub is shown first over a direct flight only when it saves for real
const MIN_SAVING_SHARE = 0.25;
const MIN_SAVING_EUROS = 30;
const KINDS = ["direct", "connection", "escapada"];

// The kinds of trip to the place searched and the one shown in the highlighted card. `best`: the cheapest direct
// fare (null: none); `trips`: the trips through a hub (server/stopovers), cheapest first. By default the cheapest
// kind, but the direct flight stays unless a stop saves 25 % or €30.
// { kinds: [{ kind, fare }], kind, choose(kind), shown: the fare of that kind }
export const useTripKind = (best, trips = []) => {
  const [chosen, setChosen] = useState(null);
  const cheapest = { direct: best, ...Object.fromEntries(KINDS.slice(1).map((kind) => [kind, trips.find((trip) => trip.kind === kind) ?? null])) };
  const kinds = KINDS.filter((kind) => cheapest[kind]).map((kind) => ({ kind, fare: cheapest[kind] }));

  const stopover = kinds.filter((option) => option.kind !== "direct").sort((first, second) => first.fare.price - second.fare.price)[0];
  const saves = best && stopover && (best.price - stopover.fare.price >= best.price * MIN_SAVING_SHARE || best.price - stopover.fare.price >= MIN_SAVING_EUROS);
  const fallback = best && !saves ? "direct" : (stopover?.kind ?? "direct");
  const kind = chosen && cheapest[chosen] ? chosen : fallback;

  return { kinds, kind, choose: setChosen, shown: cheapest[kind] };
};
