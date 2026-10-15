"use client";

import { updateTrip } from "@/store/trips";
import { DEFAULT_PREFERENCES } from "@/constants/itineraryPreferences";

// Pace, interests, transport and check-in time for the trip's itinerary, kept with the trip (the defaults while
// there is no trip yet)
export const useItineraryPreferences = (trip) => {
  const preferences = { ...DEFAULT_PREFERENCES, ...trip?.preferences };
  const save = (changes) => updateTrip(trip.id, { preferences: { ...preferences, ...changes } });

  const toggleInterest = (interest) => {
    const chosen = preferences.interests.includes(interest)
      ? preferences.interests.filter((current) => current !== interest)
      : [...preferences.interests, interest];
    // At least one interest
    if (chosen.length) save({ interests: chosen });
  };

  return {
    preferences,
    setPace: (pace) => save({ pace }),
    setTransport: (transport) => save({ transport }),
    setCheckIn: (checkIn) => save({ checkIn }),
    toggleInterest,
  };
};
