"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/i18n";
import { ROUTES } from "@/constants/routes";
import { stopsParam } from "@/utils/manualTrips";
import { plannerTownsOf } from "@/utils/multiCity";
import { cn } from "@/utils/cn";

// The card's main action: the planner with every town of the trip, its nights and the flights' times already in,
// to make the day-by-day itinerary (AI, within the itinerary limits)
const PlanButton = ({ trip, className }) => {
  const { lang, texts } = useI18n();
  return (
    <Button asChild size="lg" className={cn("h-11 text-base font-bold", className)}>
      <Link href={ROUTES.plannedTrip(lang, stopsParam(plannerTownsOf(trip)))}>
        <Sparkles />
        {texts.multiCity.plan}
      </Link>
    </Button>
  );
};

export default PlanButton;
