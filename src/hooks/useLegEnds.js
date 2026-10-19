"use client";

import { useI18n } from "@/context/i18n";
import { findAirport, useAirports } from "@/hooks/useAirports";

// Both ends of every flight of a trip, with their cities and time zones: [{ from: { code, city, tz }, to: { … } }]
export const useLegEnds = (legs) => {
  const { lang } = useI18n();
  const airports = useAirports(lang);
  const end = (code) => {
    const airport = findAirport(airports, code);
    return { code, ...airport, city: airport?.city ?? airport?.name };
  };
  return legs.map((leg) => ({ from: end(leg.from), to: end(leg.to) }));
};
