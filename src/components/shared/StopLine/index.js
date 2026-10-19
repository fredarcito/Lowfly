"use client";

import { Clock, Moon } from "lucide-react";
import { useI18n } from "@/context/i18n";

// Between two flights: the time to connect the same day, a long stop (a night, under a day there) or the nights
// spent in the city; `note` after it
const StopLine = ({ stop, note }) => {
  const { texts, format } = useI18n();
  const sameDay = stop.nights === 0;
  const Icon = sameDay ? Clock : Moon;
  const text = sameDay
    ? stop.minutes
      ? texts.results.connectionIn(format.duration(stop.minutes), stop.city)
      : texts.results.stopIn(stop.city)
    : stop.type === "layover"
      ? texts.results.longStopIn(stop.city, stop.nights)
      : texts.results.nightsIn(stop.nights, stop.city);
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      <span className="flex items-center gap-1.5">
        <Icon className="size-3.5" />
        {note ? `${text} · ${note}` : text}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
};

export default StopLine;
