"use client";

import { MapPin } from "lucide-react";
import { useI18n } from "@/context/i18n";

// The tag beside a stop the traveller asked for (docs/must-visit.md): "You asked for this", in the sea of the
// section where they chose it. Quiet, like the "Day trip" tag: not a second coral accent.
const RequestedMark = () => {
  const { texts } = useI18n();
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sea/15 px-2 py-0.5 font-sans text-xs font-semibold text-sea">
      <MapPin className="size-3" aria-hidden />
      {texts.trips.requestedTag}
    </span>
  );
};

export default RequestedMark;
