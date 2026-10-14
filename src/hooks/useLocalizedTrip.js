"use client";

import { useMemo } from "react";
import { useI18n } from "@/context/i18n";
import { findAirport, useAirports } from "@/hooks/useAirports";

// The trip with its city and country in the page language. A trip keeps the names it was saved with
// ("Roma, Italia"); the airport list comes in the current language, so they are swapped when we know the airport.
export function useLocalizedTrip(trip) {
  const { lang } = useI18n();
  const airport = findAirport(useAirports(lang), trip.fare.code);
  return useMemo(
    () => (airport ? { ...trip, fare: { ...trip.fare, city: airport.city, country: airport.country } } : trip),
    [trip, airport]
  );
}
