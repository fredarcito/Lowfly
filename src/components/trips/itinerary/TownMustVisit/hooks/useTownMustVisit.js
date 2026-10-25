"use client";

import { updateTrip } from "@/store/trips";
import { MUST_VISIT_MAX } from "@/constants/itineraryPreferences";

// The places to visit for sure in each town of a trip planned by hand, kept on its towns (trip.stops[i].mustVisit,
// as the planner's town cards keep them): adding one to a town (not twice, no more than the maximum) and removing one
export const useTownMustVisit = (trip) => {
  const placesOf = (townIndex) => trip.stops[townIndex].mustVisit ?? [];
  const save = (townIndex, mustVisit) =>
    updateTrip(trip.id, { stops: trip.stops.map((stop, position) => (position === townIndex ? { ...stop, mustVisit } : stop)) });

  const add = (townIndex, place) => {
    const places = placesOf(townIndex);
    const already = places.some((current) => (place.id ? current.id === place.id : current.name === place.name));
    if (!already && places.length < MUST_VISIT_MAX) save(townIndex, [...places, place]);
  };
  const remove = (townIndex, placeIndex) => save(townIndex, placesOf(townIndex).filter((place, position) => position !== placeIndex));

  return { placesOf, add, remove };
};
