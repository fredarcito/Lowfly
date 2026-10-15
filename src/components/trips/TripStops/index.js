"use client";

import { LogIn, LogOut, Route } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { flag } from "@/utils/format";
import Moment from "@/components/trips/TripStops/components/Moment";

// A trip planned by hand, instead of its flights: the towns in order, each with when they arrive and leave.
// Phone: one under the other; tablet and up: side by side.
const TripStops = ({ trip }) => {
  const { texts } = useI18n();
  return (
    <section className="grid gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
      <p className="flex items-center gap-2.5">
        <Route className="size-5 shrink-0 text-primary" strokeWidth={1.75} />
        <span className="font-heading font-bold">{texts.trips.route}</span>
        <span className="text-sm text-muted-foreground">· {texts.trips.townsCount(trip.stops.length)}</span>
      </p>
      <ol className="grid gap-3 sm:grid-cols-[repeat(auto-fill,minmax(14rem,1fr))]">
        {trip.stops.map((stop, index) => (
          <li key={`${stop.city}-${stop.arrive.day}`} className="flex gap-3 rounded-lg bg-muted/50 p-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {index + 1}
            </span>
            <div className="grid min-w-0 gap-1">
              <p className="truncate font-heading font-bold">
                {stop.city}{" "}
                <span className="font-sans text-sm font-normal text-muted-foreground">
                  {flag(stop.countryCode)} {stop.country}
                </span>
              </p>
              <Moment icon={LogIn} label={texts.trips.arrives} moment={stop.arrive} />
              <Moment icon={LogOut} label={texts.trips.leaves} moment={stop.leave} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default TripStops;
