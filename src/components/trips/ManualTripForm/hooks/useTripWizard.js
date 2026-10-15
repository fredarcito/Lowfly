"use client";

import { useState } from "react";
import { useTrip } from "@/hooks/useTrips";

const STEPS = ["route", "style"];

// The two steps of planning a trip by hand: the route, then the style of the itinerary. Going on saves the trip
// (so it is never lost, whatever happens next); coming back and going on again changes that same trip.
// `direction` (1 forward, -1 back) tells the step which side to slide in from.
export const useTripWizard = (form) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [tripId, setTripId] = useState(null);
  const trip = useTrip(tripId);

  const show = (index) => {
    setDirection(index > stepIndex ? 1 : -1);
    setStepIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToStyle = () => {
    const savedId = form.save(tripId);
    if (!savedId) return;
    setTripId(savedId);
    show(1);
  };

  return { steps: STEPS, step: STEPS[stepIndex], stepIndex, direction, trip, goToStyle, goBack: () => show(0) };
};
