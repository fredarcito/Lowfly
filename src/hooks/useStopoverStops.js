"use client";

import { useMemo } from "react";
import { useI18n } from "@/context/i18n";
import { useAirports } from "@/hooks/useAirports";
import { savedStopsOf } from "@/utils/stopovers";

// The towns of a trip through a hub as "Save trip" keeps them (utils/stopovers savedStopsOf), or null while the
// airports load
export const useStopoverStops = (trip) => {
  const { lang } = useI18n();
  const airports = useAirports(lang);
  return useMemo(() => {
    if (!airports.list.length) return null;
    return savedStopsOf(trip, new Map(airports.list.map((airport) => [airport.code, airport])));
  }, [trip, airports]);
};
