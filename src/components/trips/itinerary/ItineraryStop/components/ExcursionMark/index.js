"use client";

import { Signpost } from "lucide-react";
import { useI18n } from "@/context/i18n";

// The signpost beside a stop of the day trip (the same as the day's "Day trip to …" label), saying so to screen
// readers and on hover
const ExcursionMark = ({ town }) => {
  const { texts } = useI18n();
  const label = texts.trips.excursionStop(town);
  return (
    <span title={label} className="inline-grid size-5 shrink-0 place-items-center rounded-full bg-sea/15 text-sea">
      <Signpost className="size-3" aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
};

export default ExcursionMark;
