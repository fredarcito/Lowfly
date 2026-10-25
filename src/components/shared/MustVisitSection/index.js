"use client";

import { MapPin } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { cn } from "@/utils/cn";

// The section of the places the traveller wants for sure (docs/must-visit.md) in an itinerary's card: a soft sea
// tint (not coral: that is for the chosen interests and the button), its title with `note` beside it (how many) and
// what it does. `children`: the places (one MustVisitField, or one per town of a trip planned by hand).
const MustVisitSection = ({ id, note, className, children }) => {
  const { texts } = useI18n();
  const labels = texts.trips.preferences.mustVisit;
  const titleId = `${id}-title`;
  return (
    // A little more room above than between the other preferences: a section of its own starts here
    <section aria-labelledby={titleId} className={cn("mt-2", className)}>
      {/* Only a tint, no border: the card and the line under it are already two edges. Lighter in the light theme,
          where a stronger tint reads as a warning box */}
      <div className="grid gap-3 rounded-xl bg-sea/5 p-3.5 sm:p-4 dark:bg-sea/9">
        <div className="flex gap-2.5">
          <MapPin className="mt-0.5 size-4 shrink-0 text-sea" />
          <div className="grid min-w-0 gap-0.5">
            <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
              {/* A step above the other labels ("Intereses"), not a second card title */}
              <span id={titleId} className="font-medium text-foreground/85">
                {labels.label}
              </span>
              <span className="text-xs text-muted-foreground">{note}</span>
            </p>
            <p className="text-xs text-muted-foreground">{labels.help}</p>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
};

export default MustVisitSection;
