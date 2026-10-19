"use client";

import { Plane } from "lucide-react";
import AirlineBadge from "@/components/shared/AirlineBadge";
import End from "@/components/shared/FlightLeg/components/End";
import { useI18n } from "@/context/i18n";
import { flightMinutes } from "@/utils/flightTime";

// One leg: day, departure → arrival (with the flight length), airline and the price of that leg (when it has
// one of its own: a return trip from recent searches only has its total).
// from / to: { code, city, tz }. `action`: a button to buy that flight (separate tickets): the price and it go in a
// column of their own, apart from the flight like a ticket's stub. Without `icon` and `label` only the day shows
// (the next flight of the same way). A flight with no arrival time but an estimated one (`arriveEstimate`, Wizz)
// shows it as "≈ 16:20".
const FlightLeg = ({ icon: Icon, label, flight, from, to, showPrice = true, action }) => {
  const { texts, format } = useI18n();
  const estimated = !flight.arrive && flight.arriveEstimate;
  const minutes = flightMinutes(estimated ? { ...flight, arrive: flight.arriveEstimate } : flight, from.tz, to.tz);
  const price = showPrice && flight.price != null && format.money(flight.price, flight.cur);
  return (
    <div className="grid gap-3 sm:grid-cols-[6.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-5">
      <div className="flex items-center gap-2 sm:grid sm:gap-0.5">
        {label && (
          <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {Icon && <Icon className="size-3.5" />} {label}
          </span>
        )}
        <span className="text-sm font-medium first-letter:uppercase">{format.fmtDay(flight.day)}</span>
      </div>

      <div className="flex items-center gap-3">
        <End time={flight.time} airport={from} />
        <div className="grid flex-1 justify-items-center gap-1 text-muted-foreground">
          <div className="flex w-full items-center gap-1" aria-hidden>
            <span className="h-px flex-1 border-t border-dashed border-current" />
            <Plane className="size-3.5 rotate-45" />
            <span className="h-px flex-1 border-t border-dashed border-current" />
          </div>
          {minutes && <span className="text-xs">{`${estimated ? "≈ " : ""}${format.duration(minutes)}`}</span>}
        </div>
        <End
          time={estimated ? `≈ ${flight.arriveEstimate}` : flight.arrive}
          airport={to}
          align="right"
          hint={estimated ? texts.results.estimatedTime : undefined}
        />
      </div>

      {action ? (
        // The stub: what you pay there, and buying it (the airline is named on the button)
        <div className="flex items-center justify-between gap-4 sm:w-52 sm:flex-col sm:items-stretch sm:justify-center sm:gap-2 sm:self-stretch sm:border-l sm:pl-6">
          {price && <span className="font-heading text-2xl font-extrabold tabular-nums sm:text-right">{price}</span>}
          {action}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <AirlineBadge airline={flight.airline} />
          {price && <span className="min-w-20 text-right font-heading text-lg font-bold tabular-nums">{price}</span>}
        </div>
      )}
    </div>
  );
};

export default FlightLeg;
