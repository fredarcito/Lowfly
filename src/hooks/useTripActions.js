"use client";

import { useI18n } from "@/context/i18n";
import { updateTrip } from "@/store/trips";

// What can be done with a saved trip: mark it as booked and book it with the airline
export const useTripActions = (trip) => {
  const { f } = useI18n();
  return {
    setBooked: (booked) => updateTrip(trip.id, { booked }),
    toggleBooked: () => updateTrip(trip.id, { booked: !trip.booked }),
    // A trip planned by hand has no flights to book
    bookingLinks: trip.manual ? [] : f.fareLinks(trip.fare, trip.origin),
  };
};
