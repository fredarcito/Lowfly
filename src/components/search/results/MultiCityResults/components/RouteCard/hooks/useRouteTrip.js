"use client";

import { useState } from "react";
import { defaultTripOf } from "@/utils/multiCity";

// Which of a route's trips (one per version that fits, shortest first) the card shows: the one picked, else its
// default (utils/multiCity defaultTripOf: the length filter's, or the one that ranked it)
export const useRouteTrip = (route, preferred) => {
  const [chosen, setChosen] = useState(null);
  const trip = route.trips.find((other) => other.version === chosen) ?? defaultTripOf(route, preferred);
  return { trip, choose: setChosen };
};
