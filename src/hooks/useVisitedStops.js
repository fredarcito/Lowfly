"use client";

import { updateTrip } from "@/store/trips";

// Stops the traveller ticked as visited, kept with the trip
export function useVisitedStops(trip) {
  const visited = trip.visited ?? [];
  return {
    isVisited: (stopId) => visited.includes(stopId),
    toggleVisited: (stopId) =>
      updateTrip(trip.id, {
        visited: visited.includes(stopId) ? visited.filter((id) => id !== stopId) : [...visited, stopId],
      }),
    countIn: (stops) => stops.filter((stop) => visited.includes(stop.id)).length,
  };
}
