"use client";

import { useRouter } from "next/navigation";
import { useItinerary } from "@/components/trips/itinerary/Itinerary/hooks/useItinerary";
import { useOpenWhenCreated } from "@/components/trips/ManualTripForm/hooks/useOpenWhenCreated";
import { useI18n } from "@/context/i18n";
import { useItineraryPreferences } from "@/hooks/useItineraryPreferences";
import { useNeedsAccount } from "@/hooks/useNeedsAccount";
import { ROUTES } from "@/constants/routes";

// Step 2's state, held by the wizard (its card and its actions are in different places): the trip's preferences,
// creating its itinerary (`creating` until the trip opens with it), whether signing in comes first, and leaving
// it for later. `trip`: the trip saved on leaving step 1 (none before).
export const useStyleStep = (trip) => {
  const { lang } = useI18n();
  const router = useRouter();
  const { create, creation } = useItinerary(trip);
  const preferences = useItineraryPreferences(trip);
  const needsAccount = useNeedsAccount(creation.error);
  useOpenWhenCreated(trip);
  return {
    preferences,
    creation,
    needsAccount,
    creating: creation.status === "creating" || Boolean(trip?.itinerary),
    create: () => create(preferences.preferences),
    skip: () => router.push(ROUTES.trip(lang, trip.id)),
  };
};
