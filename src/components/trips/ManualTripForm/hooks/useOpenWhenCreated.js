"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/context/i18n";
import { ROUTES } from "@/constants/routes";

// Once the trip has its itinerary, open the trip (where the plan is waiting)
export const useOpenWhenCreated = (trip) => {
  const { lang } = useI18n();
  const router = useRouter();
  const created = Boolean(trip?.itinerary);
  useEffect(() => {
    if (created) router.replace(ROUTES.trip(lang, trip.id));
  }, [created, lang, router, trip?.id]);
};
