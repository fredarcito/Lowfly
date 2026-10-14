"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/context/i18n";
import { updateTrip } from "@/store/trips";
import { itineraryIn, sampleItinerary } from "@/utils/itinerary";

// A trip's itinerary (in the page language when it can be), the picked day and how to (re)create it.
// Until the AI is connected, creating uses a hand-made sample (utils/itinerary).
export function useItinerary(trip) {
  const { lang } = useI18n();
  const [pickedIndex, setPickedIndex] = useState(0);
  const itinerary = useMemo(() => trip.itinerary && itineraryIn(trip.itinerary, trip, lang), [trip, lang]);
  const days = itinerary?.days ?? [];
  const index = Math.min(pickedIndex, Math.max(days.length - 1, 0));

  // `preferences` (pace, interests, transport) will steer the AI; the sample ignores them
  function create(preferences) {
    updateTrip(trip.id, { itinerary: { ...sampleItinerary(trip, lang), preferences } });
    setPickedIndex(0);
  }

  return { itinerary, days, day: days[index], dayIndex: index, pickDay: setPickedIndex, create };
}
