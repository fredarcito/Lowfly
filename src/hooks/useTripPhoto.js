"use client";

import { usePhoto } from "@/hooks/usePhoto";
import { usePlacePhoto } from "@/hooks/usePlacePhoto";

// A trip's photo: the destination's (by its airport) for a flight; the first town's for a trip planned by hand,
// wherever it is. undefined while loading, null when there is none.
export const useTripPhoto = (trip) => {
  const firstStop = trip.manual ? trip.stops?.[0] : null;
  const airportPhoto = usePhoto(firstStop ? null : trip.fare.code);
  const placePhoto = usePlacePhoto(firstStop ? { city: firstStop.city, lat: firstStop.lat, lng: firstStop.lng } : null);
  return firstStop ? placePhoto : airportPhoto;
};
