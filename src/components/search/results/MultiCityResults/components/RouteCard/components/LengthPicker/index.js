"use client";

import { useI18n } from "@/context/i18n";
import { tripDays } from "@/utils/multiCity";
import { cn } from "@/utils/cn";

// The lengths a route comes in for the dates (its trips, one per version), as a quiet segmented control: neutral, so
// the card's one coloured action stays "Genera tu itinerario personalizado". No prices: the card's price follows.
const LengthPicker = ({ trips, value, onChange }) => {
  const { texts } = useI18n();
  const labels = texts.multiCity;
  return (
    <div role="radiogroup" aria-label={labels.filterAria} className="inline-flex w-fit rounded-lg bg-muted p-0.5">
      {trips.map((trip) => {
        const checked = trip.version === value;
        return (
          <button
            key={trip.version}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => onChange(trip.version)}
            className={cn(
              "rounded-md px-3 py-1 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              checked ? "bg-card text-foreground shadow-sm ring-1 ring-foreground/10" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {labels.days(tripDays(trip))}
          </button>
        );
      })}
    </div>
  );
};

export default LengthPicker;
