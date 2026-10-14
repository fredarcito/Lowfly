"use client";

import { useMemo } from "react";
import { useI18n } from "@/context/i18n";
import { findAirport, useAirports } from "@/hooks/useAirports";

// The trip with its city and country in the page language. A trip keeps the names it was saved with
// ("Roma, Italia"); the airport list comes in the current language, so they are swapped when we know the airport.
export const useLocalizedTrip = (trip) => {
  const { lang } = useI18n();
  const airport = findAirport(useAirports(lang), trip.fare.code);
  return useMemo(
    // A trip planned by hand keeps the towns' own names (its code is only the nearest airport)
    () => (airport && !trip.manual ? { ...trip, fare: { ...trip.fare, city: airport.city, country: airport.country } } : trip),
    [trip, airport]
  );
};
