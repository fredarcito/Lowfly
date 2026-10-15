"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { useI18n } from "@/context/i18n";
import { useTrip } from "@/hooks/useTrips";
import { saveSharedTrip } from "@/store/trips";
import { ROUTES } from "@/constants/routes";

// Keeping a shared trip among the visitor's own: `saved` once it is (then `href` opens it).
// `save` keeps it in the account and opens it; signed out, it asks to sign in first and the trip is kept on
// the way back (useSaveAfterSignIn), so it is never only in this browser. `busy` while the account loads.
export const useSaveSharedTrip = (trip) => {
  const { lang } = useI18n();
  const { status, tripsReady } = useAuth();
  const { id: shareId } = useParams();
  const router = useRouter();
  const saved = Boolean(useTrip(trip.id));
  const href = ROUTES.trip(lang, trip.id);

  const save = () => {
    if (status !== "signedIn") {
      router.push(ROUTES.login(lang, ROUTES.sharedTrip(lang, shareId, true)));
      return;
    }
    saveSharedTrip(trip);
    router.push(href);
  };

  return { saved, href, save, busy: status === "loading" || (status === "signedIn" && !tripsReady) };
};
