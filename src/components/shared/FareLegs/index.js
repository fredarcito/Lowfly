"use client";

import { Moon } from "lucide-react";
import FareLeg from "@/components/shared/FareLeg";
import { useI18n } from "@/context/i18n";

// Fare details: the outbound flight and, for a return trip, the stay and the return flight.
// `legPrices`: each flight's price (useless on a one-way trip shown next to its total). `footer` goes under
// the flights, in the same box (an opened result: price, baggage and booking).
const FareLegs = ({ fare, origin, legPrices = true, footer }) => {
  const { texts } = useI18n();

  return (
    <div className="grid gap-4 rounded-xl bg-muted/50 p-4 sm:p-5">
      <FareLeg fare={fare} origin={origin} direction="out" showPrice={legPrices} />
      {fare.ret && (
        <>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span className="flex items-center gap-1.5">
              <Moon className="size-3.5" />
              {texts.results.nightsIn(fare.nights, fare.city)}
              {/* Hours there only matter on a short break */}
              {fare.hours && fare.nights <= 3 && ` · ${texts.results.hoursAway(fare.hours)}`}
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <FareLeg fare={fare} origin={origin} direction="ret" showPrice={legPrices} />
        </>
      )}
      {footer && <div className="border-t pt-4">{footer}</div>}
    </div>
  );
};

export default FareLegs;
