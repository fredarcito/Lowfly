"use client";

import { useI18n } from "@/context/i18n";
import { daysUntil, isUpcoming } from "@/store/trips";

// When the trip is: "in 9 days", "tomorrow", "you're on your trip"…
export const useTripWhen = (trip) => {
  const { texts } = useI18n();
  const days = daysUntil(trip);
  return days < 0 && isUpcoming(trip) ? texts.trips.ongoing : texts.trips.when(days);
};
