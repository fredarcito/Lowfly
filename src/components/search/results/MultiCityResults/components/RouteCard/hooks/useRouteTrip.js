"use client";

import { useState } from "react";

// Which of a route's trips (one per version that fits, shortest first) the card shows: `preferred` (the length
// filter's version) when the route has it, otherwise the longest; the visitor can switch to another
export const useRouteTrip = (route, preferred) => {
  const [chosen, setChosen] = useState(null);
  const byVersion = (version) => route.trips.find((trip) => trip.version === version);
  const trip = byVersion(chosen) ?? byVersion(preferred) ?? route.trips.at(-1);
  return { trip, choose: setChosen };
};
