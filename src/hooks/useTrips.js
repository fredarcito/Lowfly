"use client";

import { useMemo, useSyncExternalStore } from "react";
import { isUpcoming, NO_TRIPS, readTrips, subscribeToTrips } from "@/store/trips";

// Saved trips, soonest first, kept up to date. On the server (and before hydrating) there are none.
export const useTrips = () => useSyncExternalStore(subscribeToTrips, readTrips, () => NO_TRIPS);

// One saved trip by id (undefined if it does not exist)
export const useTrip = (id) => {
  const trips = useTrips();
  return id ? trips.find((saved) => saved.id === id) : undefined;
};

// { upcoming: soonest first, past: most recent first }
export const useTripGroups = () => {
  const trips = useTrips();
  return useMemo(
    () => ({
      upcoming: trips.filter(isUpcoming),
      past: trips.filter((saved) => !isUpcoming(saved)).reverse(),
    }),
    [trips]
  );
};
