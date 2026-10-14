"use client";

import { useMemo, useState } from "react";
import { createItinerary } from "@/api/itinerary";
import { apiError } from "@/api/client";
import { useI18n } from "@/context/i18n";
import { updateTrip } from "@/store/trips";
import { itineraryIn } from "@/utils/itinerary";

// What the AI needs to know about the flights: where, and when you land and leave
const tripForAi = (trip) => {
  const { fare } = trip;
  const out = fare.out ?? fare;
  return {
    origin: trip.origin,
    code: fare.code,
    city: fare.city,
    country: fare.country,
    out: { day: out.day, time: out.time ?? null, arrive: out.arrive ?? null },
    ret: fare.ret ? { day: fare.ret.day, time: fare.ret.time ?? null, arrive: fare.ret.arrive ?? null } : null,
  };
};

// A trip's itinerary (samples follow the page language; AI ones keep theirs), the picked day,
// and creating it with the AI: { status: "idle" | "creating" | "error", error }
export const useItinerary = (trip) => {
  const { lang } = useI18n();
  const [pickedIndex, setPickedIndex] = useState(0);
  const [creation, setCreation] = useState({ status: "idle" });
  const itinerary = useMemo(() => trip.itinerary && itineraryIn(trip.itinerary, trip, lang), [trip, lang]);
  const days = itinerary?.days ?? [];
  const index = Math.min(pickedIndex, Math.max(days.length - 1, 0));

  const create = async (preferences) => {
    setCreation({ status: "creating" });
    try {
      const created = await createItinerary({ trip: tripForAi(trip), lang, preferences });
      updateTrip(trip.id, { itinerary: created, visited: [] });
      setPickedIndex(0);
      setCreation({ status: "idle" });
    } catch (error) {
      setCreation({ status: "error", error: apiError(error) });
    }
  };

  return { itinerary, days, day: days[index], dayIndex: index, pickDay: setPickedIndex, create, creation };
};
