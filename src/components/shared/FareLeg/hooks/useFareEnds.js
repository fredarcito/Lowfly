"use client";

import { useI18n } from "@/context/i18n";
import { findAirport, useAirports } from "@/hooks/useAirports";

// The two ends of a fare (home: the departure airport; away: the destination), with their cities: { code, city, tz }.
// Ryanair and Wizz name some airports after the airport, not the town: the city is shown.
export const useFareEnds = (fare, origin) => {
  const { lang } = useI18n();
  const airports = useAirports(lang);
  const home = { code: origin, ...findAirport(airports, origin) };
  const away = { code: fare.code, city: fare.city, ...findAirport(airports, fare.code) };
  home.city = home.city ?? home.name;
  away.city = fare.city ?? away.city;
  return { home, away };
};
