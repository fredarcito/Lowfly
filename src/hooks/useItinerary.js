"use client";

import { useState } from "react";
import { updateTrip } from "@/store/trips";
import { sampleItinerary } from "@/utils/itinerary";

// A trip's itinerary, the picked day and how to (re)create it.
// Until the AI is connected, creating uses a hand-made sample (utils/itinerary).
export function useItinerary(trip) {
  const [pickedIndex, setPickedIndex] = useState(0);
  const itinerary = trip.itinerary;
  const days = itinerary?.days ?? [];
  const index = Math.min(pickedIndex, Math.max(days.length - 1, 0));

  // `preferences` (pace, interests, transport) will steer the AI; the sample ignores them
  function create(preferences) {
    updateTrip(trip.id, { itinerary: { ...sampleItinerary(trip), preferences } });
    setPickedIndex(0);
  }

  return { itinerary, days, day: days[index], dayIndex: index, pickDay: setPickedIndex, create };
}
