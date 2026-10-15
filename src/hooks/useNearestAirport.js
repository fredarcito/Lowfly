"use client";

import { useState } from "react";
import { km } from "@/utils/itinerary";

// The browser may reuse a position up to this old, and gives up after this long
const MAX_POSITION_AGE_MS = 600_000;
const TIMEOUT_MS = 10_000;

// "Use my location": the airport nearest to the visitor, worked out in the browser (the position is never sent).
// status: idle | busy | error. `findNearest(airports, onFound)` calls onFound with the nearest airport.
export const useNearestAirport = () => {
  const [status, setStatus] = useState("idle");

  const findNearest = (airports, onFound) => {
    setStatus("busy");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const here = { lat: coords.latitude, lng: coords.longitude };
        const distance = (airport) => km(here, { lat: airport.lat, lng: airport.lon });
        const nearest = airports
          .filter((airport) => airport.lat != null)
          .reduce((best, airport) => (!best || distance(airport) < distance(best) ? airport : best), null);
        setStatus("idle");
        if (nearest) onFound(nearest);
      },
      () => setStatus("error"),
      { timeout: TIMEOUT_MS, maximumAge: MAX_POSITION_AGE_MS }
    );
  };

  return { status, findNearest };
};
