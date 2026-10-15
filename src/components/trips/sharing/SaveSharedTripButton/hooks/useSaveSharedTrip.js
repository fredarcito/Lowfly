"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/context/i18n";
import { useTrip } from "@/hooks/useTrips";
import { saveSharedTrip } from "@/store/trips";
import { ROUTES } from "@/constants/routes";

// Keeping a shared trip among the visitor's own: `saved` once it is (then `href` opens it); `save` keeps it
// and opens it
export const useSaveSharedTrip = (trip) => {
  const { lang } = useI18n();
  const router = useRouter();
  const saved = Boolean(useTrip(trip.id));
  const href = ROUTES.trip(lang, trip.id);
  const save = () => {
    saveSharedTrip(trip);
    router.push(href);
  };
  return { saved, href, save };
};
