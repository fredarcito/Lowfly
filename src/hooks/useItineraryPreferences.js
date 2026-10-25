"use client";

import { updateTrip } from "@/store/trips";
import { DEFAULT_PREFERENCES, MUST_VISIT_MAX } from "@/constants/itineraryPreferences";

// Pace, interests, transport, check-in time and the places to visit for sure, for the trip's itinerary, kept with
// the trip (the defaults while there is no trip yet)
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

  // A place to visit for sure (MustVisitField): not twice, and no more than the maximum
  const addMustVisit = (place) => {
    const { mustVisit } = preferences;
    const already = mustVisit.some((current) => (place.id ? current.id === place.id : current.name === place.name));
    if (!already && mustVisit.length < MUST_VISIT_MAX) save({ mustVisit: [...mustVisit, place] });
  };
  const removeMustVisit = (index) => save({ mustVisit: preferences.mustVisit.filter((place, current) => current !== index) });

  return {
    preferences,
    setPace: (pace) => save({ pace }),
    setTransport: (transport) => save({ transport }),
    setCheckIn: (checkIn) => save({ checkIn }),
    toggleInterest,
    addMustVisit,
    removeMustVisit,
  };
};
