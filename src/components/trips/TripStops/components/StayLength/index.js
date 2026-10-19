"use client";

import { Clock, Moon } from "lucide-react";
import stayOf from "@/components/trips/TripStops/utils/stayOf";
import { useI18n } from "@/context/i18n";

// How long they stay in a town: "☾ 2 noches", "🕐 6 h" or "De paso". `compact` keeps only the number of nights
// ("☾ 2"), for the folded route line.
const StayLength = ({ stop, compact = false }) => {
  const { texts, format } = useI18n();
  const stay = stayOf(stop);
  if (stay.passing) return <span className="whitespace-nowrap">{texts.trips.passingThrough}</span>;
  const Icon = stay.nights ? Moon : Clock;
  const label = stay.nights ? texts.units.nights(stay.nights) : format.duration(stay.minutes);
  return (
    <span title={label} className="inline-flex items-center gap-1 whitespace-nowrap">
      <Icon className="size-3 shrink-0" aria-hidden />
      {compact && stay.nights ? (
        <>
          {stay.nights}
          <span className="sr-only"> {label}</span>
        </>
      ) : (
        label
      )}
    </span>
  );
};

export default StayLength;
