"use client";

import { useState } from "react";
import { createItinerary } from "@/api/itinerary";
import { apiError } from "@/api/client";
import { useAuth } from "@/context/auth";
import { useI18n } from "@/context/i18n";
import { countGuestItinerary } from "@/store/guestItineraries";
import { updateTrip } from "@/store/trips";

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

// A trip planned by hand: each town, where it is, and when they arrive and leave
const stopsForAi = (trip) =>
  trip.stops.map(({ city, country, lat, lng, arrive, leave }) => ({ city, country, lat, lng, arrive, leave }));

// A trip's itinerary (in the language it was made in), the picked day,
// and creating it with the AI: { status: "idle" | "creating" | "error", error }. `trip` may not exist yet
// (the planning wizard, before its route is saved): nothing to show then.
export const useItinerary = (trip) => {
  const { lang } = useI18n();
  const { status } = useAuth();
  const [pickedIndex, setPickedIndex] = useState(0);
  const [creation, setCreation] = useState({ status: "idle" });
  const itinerary = trip?.itinerary;
  const days = itinerary?.days ?? [];
  const index = Math.min(pickedIndex, Math.max(days.length - 1, 0));

  const create = async (preferences) => {
    setCreation({ status: "creating" });
    try {
      const created = trip.manual
        ? await createItinerary({ stops: stopsForAi(trip), lang, preferences })
        : await createItinerary({ trip: tripForAi(trip), lang, preferences });
      updateTrip(trip.id, { itinerary: created, visited: [] });
      // Without an account, the free ones are counted in this browser
      if (status !== "signedIn") countGuestItinerary();
      setPickedIndex(0);
      setCreation({ status: "idle" });
    } catch (error) {
      setCreation({ status: "error", error: apiError(error) });
    }
  };

  return { itinerary, days, day: days[index], dayIndex: index, pickDay: setPickedIndex, create, creation };
};
