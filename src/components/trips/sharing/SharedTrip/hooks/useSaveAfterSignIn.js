"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { useI18n } from "@/context/i18n";
import { saveSharedTrip } from "@/store/trips";
import { ROUTES, SAVE_SHARED_TRIP } from "@/constants/routes";

// Back from signing in to save a shared trip (?save=1): once the account's trips are in (so it is copied to
// the account too), keep it and open it in My trips
export const useSaveAfterSignIn = (trip) => {
  const { lang } = useI18n();
  const { status, tripsReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status !== "signedIn" || !tripsReady) return;
    if (new URLSearchParams(window.location.search).get(SAVE_SHARED_TRIP) !== "1") return;
    saveSharedTrip(trip);
    router.replace(ROUTES.trip(lang, trip.id));
  }, [status, tripsReady, trip, lang, router]);
};
