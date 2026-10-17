"use client";

import { Signpost } from "lucide-react";
import { useI18n } from "@/context/i18n";

// A day spent out of town: "Day trip to Winterset · 45 min each way", so it reads at a glance that this day
// means travelling; by car, with its stops on the way ("Day trip to Shkodër, via Krujë · 1 h 30 min each way").
// `excursion`: { town, via, travelMinutes }.
const ExcursionBadge = ({ excursion }) => {
  const { texts, format } = useI18n();
  return (
    <p className="flex w-fit items-center gap-1.5 rounded-full bg-sea/15 px-2.5 py-1 text-xs font-semibold text-sea">
      <Signpost className="size-3.5 shrink-0" />
      {texts.trips.excursion(texts.trips.excursionRoute(excursion.town, excursion.via), format.duration(excursion.travelMinutes))}
    </p>
  );
};

export default ExcursionBadge;
