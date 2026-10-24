"use client";

import { useMemo } from "react";
import { useI18n } from "@/context/i18n";
import { updateTrip } from "@/store/trips";
import { createFormat } from "@/utils/format";

// What can be done with a saved trip: mark it as booked and book it with the airline (for all the adults it was
// searched for, `trip.passengers`)
export const useTripActions = (trip) => {
  const { lang, texts } = useI18n();
  const format = useMemo(() => createFormat(lang, texts, trip.passengers ?? 1), [lang, texts, trip.passengers]);
  return {
    setBooked: (booked) => updateTrip(trip.id, { booked }),
    toggleBooked: () => updateTrip(trip.id, { booked: !trip.booked }),
    // A trip planned by hand has no flights to book; one through a hub books each flight on its own
    bookingLinks: trip.flights ? format.legLinks(trip.flights.legs) : trip.manual ? [] : format.fareLinks(trip.fare, trip.origin),
  };
};
