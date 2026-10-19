"use client";

import { useId, useState } from "react";
import { ChevronDown, Route } from "lucide-react";
import Collapse from "@/components/shared/Collapse";
import RouteStop from "@/components/trips/TripStops/components/RouteStop";
import RouteSummary from "@/components/trips/TripStops/components/RouteSummary";
import { useI18n } from "@/context/i18n";
import { cn } from "@/utils/cn";

// A trip planned by hand, instead of its flights: the towns in order. Folded it is one line (each town and its
// nights), since the header already gives the dates; open, a card per town with its arrival, departure and stay.
// Wider screens: that line sits in the title row and stays there open; phones: under the title, only folded.
// The cards share the width (two towns: half each; many: rows of up to three); phones: one under the other.
const TripStops = ({ trip }) => {
  const { texts } = useI18n();
  const [open, setOpen] = useState(false);
  const stopsId = useId();
  return (
    <section className="grid rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={stopsId}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        className="flex w-full items-center gap-2.5 rounded-md text-left outline-none hover:text-primary-ink focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Route className="size-5 shrink-0 text-primary" strokeWidth={1.75} />
        <span className="font-heading font-bold">{texts.trips.route}</span>
        <span className="shrink-0 text-sm text-muted-foreground">· {texts.trips.townsCount(trip.stops.length)}</span>
        <span className="min-w-0 flex-1 border-l pl-4 text-foreground max-sm:hidden">
          <RouteSummary stops={trip.stops} />
        </span>
        <ChevronDown className={cn("ml-auto size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      <Collapse open={!open} className="sm:hidden">
        <div className="pt-3">
          <RouteSummary stops={trip.stops} />
        </div>
      </Collapse>
      <Collapse open={open}>
        <ol id={stopsId} className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(18rem,1fr))]">
          {trip.stops.map((stop, index) => (
            <RouteStop key={`${stop.city}-${stop.arrive.day}`} stop={stop} number={index + 1} />
          ))}
        </ol>
      </Collapse>
    </section>
  );
};

export default TripStops;
