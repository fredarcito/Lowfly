"use client";

import { Moon, Plane, PlaneLanding, PlaneTakeoff } from "lucide-react";
import AirlineBadge from "@/components/shared/AirlineBadge";
import { useI18n } from "@/context/i18n";
import { findAirport, useAirports } from "@/hooks/useAirports";
import { flightMinutes } from "@/utils/flightTime";

// One end of a flight: time, airport code and city
function End({ time, airport, align = "left" }) {
  return (
    <div className={align === "right" ? "grid text-right" : "grid"}>
      <span className="font-heading text-xl font-bold tabular-nums sm:text-2xl">{time || "—"}</span>
      <span className="text-xs font-semibold tracking-wider">{airport.code}</span>
      {airport.city && <span className="truncate text-xs text-muted-foreground">{airport.city}</span>}
    </div>
  );
}

// One leg: day, departure → arrival (with the flight length), airline and the price of that leg.
// from / to: { code, city, tz }
function Leg({ icon: Icon, label, flight, from, to }) {
  const { f } = useI18n();
  const minutes = flightMinutes(flight, from.tz, to.tz);
  return (
    <div className="grid gap-3 sm:grid-cols-[6.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-5">
      <div className="flex items-center gap-2 sm:grid sm:gap-0.5">
        <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          <Icon className="size-3.5" /> {label}
        </span>
        <span className="text-sm font-medium first-letter:uppercase">{f.fmtDay(flight.day)}</span>
      </div>

      <div className="flex items-center gap-3">
        <End time={flight.time} airport={from} />
        <div className="grid flex-1 justify-items-center gap-1 text-muted-foreground">
          <div className="flex w-full items-center gap-1" aria-hidden>
            <span className="h-px flex-1 border-t border-dashed border-current" />
            <Plane className="size-3.5 rotate-45" />
            <span className="h-px flex-1 border-t border-dashed border-current" />
          </div>
          {minutes && <span className="text-xs">{f.duration(minutes)}</span>}
        </div>
        <End time={flight.arrive} airport={to} align="right" />
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <AirlineBadge airline={flight.airline} />
        <span className="min-w-20 text-right font-heading text-lg font-bold tabular-nums">{f.money(flight.price, flight.cur)}</span>
      </div>
    </div>
  );
}

// Fare details: the outbound flight and, for a return trip, the stay and the return flight
export default function FareLegs({ fare, origin }) {
  const { lang, t } = useI18n();
  const airports = useAirports(lang);
  const out = fare.out || fare;
  const home = { code: origin, ...findAirport(airports, origin) };
  const away = { code: fare.code, city: fare.city, ...findAirport(airports, fare.code) };
  // Ryanair and Wizz name some airports after the airport, not the town: show the city
  home.city = home.city ?? home.name;
  away.city = fare.city ?? away.city;

  return (
    <div className="grid gap-4 rounded-xl bg-muted/50 p-4 sm:p-5">
      <Leg icon={PlaneTakeoff} label={t.results.out} flight={out} from={home} to={away} />
      {fare.ret && (
        <>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span className="flex items-center gap-1.5">
              <Moon className="size-3.5" />
              {t.results.nightsIn(fare.nights, fare.city)}
              {/* Hours there only matter on a short break */}
              {fare.hours && fare.nights <= 3 && ` · ${t.results.hoursAway(fare.hours)}`}
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <Leg icon={PlaneLanding} label={t.results.ret} flight={fare.ret} from={away} to={home} />
        </>
      )}
    </div>
  );
}
