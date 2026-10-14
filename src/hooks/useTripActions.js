"use client";

import { useI18n } from "@/context/i18n";
import { updateTrip } from "@/store/trips";

// What can be done with a saved trip: mark it as booked and book it with the airline
export function useTripActions(trip) {
  const { f } = useI18n();
  return {
    setBooked: (booked) => updateTrip(trip.id, { booked }),
    toggleBooked: () => updateTrip(trip.id, { booked: !trip.booked }),
    bookingLinks: f.fareLinks(trip.fare, trip.origin),
  };
}
