"use client";

import { Plane } from "lucide-react";
import AirlineBadge from "@/components/shared/AirlineBadge";
import End from "@/components/shared/FareLeg/components/Leg/components/End";
import { useI18n } from "@/context/i18n";
import { flightMinutes } from "@/utils/flightTime";

// One leg: day, departure → arrival (with the flight length), airline and the price of that leg.
// from / to: { code, city, tz }
const Leg = ({ icon: Icon, label, flight, from, to, showPrice = true }) => {
  const { format } = useI18n();
  const minutes = flightMinutes(flight, from.tz, to.tz);
  return (
    <div className="grid gap-3 sm:grid-cols-[6.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-5">
      <div className="flex items-center gap-2 sm:grid sm:gap-0.5">
        <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          <Icon className="size-3.5" /> {label}
        </span>
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
          {minutes && <span className="text-xs">{format.duration(minutes)}</span>}
        </div>
        <End time={flight.arrive} airport={to} align="right" />
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <AirlineBadge airline={flight.airline} />
        {showPrice && <span className="min-w-20 text-right font-heading text-lg font-bold tabular-nums">{format.money(flight.price, flight.cur)}</span>}
      </div>
    </div>
  );
};

export default Leg;
