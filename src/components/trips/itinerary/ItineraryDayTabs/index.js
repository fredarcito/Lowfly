"use client";

import { useI18n } from "@/context/i18n";
import { cn } from "@/utils/cn";

// "Day 1 · Mon 19 Oct" tabs; they scroll sideways when they do not fit, and stay at the top while the day scrolls.
// `belowBar`: on phones and tablets the slim bar (ItineraryStickyBar) is showing, so they stick right under it.
export default function ItineraryDayTabs({ days, picked, onPick, belowBar = false }) {
  const { t, f } = useI18n();
  return (
    <div
      className={cn(
        "sticky top-0 z-20 -mx-4 self-start bg-background/90 px-4 backdrop-blur-md transition-[top] duration-300 ease-out motion-reduce:transition-none sm:-mx-6 sm:px-6",
        belowBar && "max-lg:top-[calc(3.5rem+1px+env(safe-area-inset-top,0px))]"
      )}
    >
      <div
        role="tablist"
        aria-label={t.trips.itinerary}
        className="flex gap-2 overflow-x-auto py-1.5 sm:py-2 scrollbar-none"
      >
        {days.map((day, index) => (
          <button
            key={day.date}
            role="tab"
            type="button"
            aria-selected={index === picked}
            onClick={() => onPick(index)}
            className={cn(
              // Phone: one compact line ("Day 1 · Fri 16"); tablet and up: two lines
              "flex shrink-0 items-baseline justify-center gap-1.5 rounded-lg border px-3 py-1.5 whitespace-nowrap transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:grid sm:min-w-26 sm:flex-1 sm:justify-items-center sm:gap-0 sm:rounded-xl sm:px-4 sm:py-2",
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
    </div>
  );
}
