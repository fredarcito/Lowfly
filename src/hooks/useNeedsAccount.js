"use client";

import { useAuth } from "@/context/auth";
import { guestItineraries } from "@/store/guestItineraries";
import { ITINERARY_LIMITS } from "@/constants/itineraryLimits";

// Whether creating an itinerary needs signing in first: without an account, once the free ones are used (in
// this browser, or the server said so with `error`). Only while the switch in constants/itineraryLimits is on.
export const useNeedsAccount = (error) => {
  const { status } = useAuth();
  return (
    ITINERARY_LIMITS.requireAccount &&
    status === "signedOut" &&
    (guestItineraries() >= ITINERARY_LIMITS.freeInBrowser || error?.code === "aiSignIn")
  );
};
