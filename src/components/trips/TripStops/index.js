"use client";

import { Route } from "lucide-react";
import RouteStop from "@/components/trips/TripStops/components/RouteStop";
import { useI18n } from "@/context/i18n";

// A trip planned by hand, instead of its flights: the towns in order, each with its nights, arrival and departure.
// They share the width (two towns: half each; many: rows of up to three); phones: one under the other.
const TripStops = ({ trip }) => {
  const { texts } = useI18n();
  return (
    <section className="grid gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
      <p className="flex items-center gap-2.5">
        <Route className="size-5 shrink-0 text-primary" strokeWidth={1.75} />
        <span className="font-heading font-bold">{texts.trips.route}</span>
        <span className="text-sm text-muted-foreground">· {texts.trips.townsCount(trip.stops.length)}</span>
      </p>
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(18rem,1fr))]">
        {trip.stops.map((stop, index) => (
          <RouteStop key={`${stop.city}-${stop.arrive.day}`} stop={stop} number={index + 1} />
        ))}
      </ol>
    </section>
  );
};

export default TripStops;
