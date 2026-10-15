"use client";

import { Signpost } from "lucide-react";
import { useI18n } from "@/context/i18n";

// The tag beside a stop of the day trip: "Day trip", in the colours of the day's "Day trip to …" label. On hover
// (and for screen readers), which town.
const ExcursionMark = ({ town }) => {
  const { texts } = useI18n();
  return (
    <span
      title={texts.trips.excursionStop(town)}
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sea/15 px-2 py-0.5 font-sans text-xs font-semibold text-sea"
    >
      <Signpost className="size-3" aria-hidden />
      {texts.trips.excursionTag}
      <span className="sr-only"> · {town}</span>
    </span>
  );
};

export default ExcursionMark;
