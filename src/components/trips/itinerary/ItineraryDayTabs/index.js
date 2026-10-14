"use client";

import { useI18n } from "@/context/i18n";
import { cn } from "@/utils/cn";

// "Day 1 · Mon 19 Oct" tabs; they scroll sideways when they do not fit
export default function ItineraryDayTabs({ days, picked, onPick }) {
  const { t, f } = useI18n();
  return (
    <div role="tablist" aria-label={t.trips.itinerary} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:px-0">
      {days.map((day, index) => (
        <button
          key={day.date}
          role="tab"
          type="button"
          aria-selected={index === picked}
          onClick={() => onPick(index)}
          className={cn(
            "grid min-w-26 flex-1 shrink-0 justify-items-center rounded-xl border px-4 py-2 transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
            index === picked ? "border-primary bg-primary text-primary-foreground shadow-sm" : "bg-card hover:bg-muted"
          )}
        >
          <span className="font-heading text-sm font-bold">{t.trips.day(index + 1)}</span>
          <span className={cn("text-xs first-letter:uppercase", index === picked ? "text-primary-foreground/85" : "text-muted-foreground")}>
            {f.fmtShort(day.date)}
          </span>
        </button>
      ))}
    </div>
  );
}
