"use client";

import { useI18n } from "@/context/i18n";

// "OUT · Fri 23 Oct · 16:25 → 17:20": the day and the times are what decide a flight (the route is above)
const FlightSummary = ({ label, flight }) => {
  const { format } = useI18n();
  return (
    <span className="flex flex-wrap items-baseline gap-x-2">
      <span className="font-heading font-bold uppercase">{label}</span>
      <span className="text-muted-foreground first-letter:uppercase">{format.fmtDay(flight.day)}</span>
      <span className="font-medium tabular-nums">
        {flight.time}
        {flight.arrive && ` → ${flight.arrive}`}
      </span>
    </span>
  );
};

export default FlightSummary;
