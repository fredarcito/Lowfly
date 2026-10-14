"use client";

import { Moon, Plane, PlaneLanding, PlaneTakeoff } from "lucide-react";
import AirlineBadge from "@/components/shared/AirlineBadge";
import { useI18n } from "@/context/i18n";
import { findAirport, useAirports } from "@/hooks/useAirports";
import { flightMinutes } from "@/utils/flightTime";

// One end of a flight: time, airport code and city
const End = ({ time, airport, align = "left" }) => {
  return (
    <div className={align === "right" ? "grid text-right" : "grid"}>
      <span className="font-heading text-xl font-bold tabular-nums sm:text-2xl">{time || "—"}</span>
      <span className="text-xs font-semibold tracking-wider">{airport.code}</span>
      {airport.city && <span className="truncate text-xs text-muted-foreground">{airport.city}</span>}
    </div>
  );
};

// One leg: day, departure → arrival (with the flight length), airline and the price of that leg.
// from / to: { code, city, tz }
const Leg = ({ icon: Icon, label, flight, from, to, showPrice = true }) => {
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
        {showPrice && <span className="min-w-20 text-right font-heading text-lg font-bold tabular-nums">{f.money(flight.price, flight.cur)}</span>}
      </div>
    </div>
  );
};

// The two ends of a fare (home: the departure airport; away: the destination), with their cities.
// Ryanair and Wizz name some airports after the airport, not the town: the city is shown.
const fareEnds = (airports, fare, origin) => {
  const home = { code: origin, ...findAirport(airports, origin) };
  const away = { code: fare.code, city: fare.city, ...findAirport(airports, fare.code) };
  home.city = home.city ?? home.name;
  away.city = fare.city ?? away.city;
  return { home, away };
};

// One flight of a fare on its own (`direction`: out | ret), as in FareLegs
export const FareLeg = ({ fare, origin, direction = "out", showPrice = true }) => {
  const { lang, t } = useI18n();
  const { home, away } = fareEnds(useAirports(lang), fare, origin);
  return direction === "ret" ? (
    <Leg icon={PlaneLanding} label={t.results.ret} flight={fare.ret} from={away} to={home} showPrice={showPrice} />
  ) : (
    <Leg icon={PlaneTakeoff} label={t.results.out} flight={fare.out || fare} from={home} to={away} showPrice={showPrice} />
  );
};

// Fare details: the outbound flight and, for a return trip, the stay and the return flight.
// `legPrices`: each flight's price (useless on a one-way trip shown next to its total). `footer` goes under
// the flights, in the same box (an opened result: price, baggage and booking).
const FareLegs = ({ fare, origin, legPrices = true, footer }) => {
  const { lang, t } = useI18n();
  const out = fare.out || fare;
  const { home, away } = fareEnds(useAirports(lang), fare, origin);

  return (
    <div className="grid gap-4 rounded-xl bg-muted/50 p-4 sm:p-5">
      <Leg icon={PlaneTakeoff} label={t.results.out} flight={out} from={home} to={away} showPrice={legPrices} />
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
          <Leg icon={PlaneLanding} label={t.results.ret} flight={fare.ret} from={away} to={home} showPrice={legPrices} />
        </>
      )}
      {footer && <div className="border-t pt-4">{footer}</div>}
    </div>
  );
};

export default FareLegs;
