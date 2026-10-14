"use client";

import { useState } from "react";
import { Car, Footprints, TrainFront } from "lucide-react";
import DayRouteLinks from "@/components/trips/itinerary/DayRouteLinks";
import ItineraryMap from "@/components/trips/itinerary/ItineraryMap";
import ItineraryStop from "@/components/trips/itinerary/ItineraryStop";
import { useI18n } from "@/context/i18n";
import { useDayPlan } from "@/hooks/useDayPlan";

const MODE_ICONS = { walking: Footprints, driving: Car, transit: TrainFront };

// One day: its title and Maps route, then the stops next to the map (desktop) or under it (phone).
// The list and the map share the picked stop.
export default function ItineraryDay({ day, dayNumber }) {
  const { t } = useI18n();
  const { stops, mapStops, focus, routes } = useDayPlan(day);
  const [activeStop, setActiveStop] = useState(null);
  const ModeIcon = MODE_ICONS[day.mode] ?? Footprints;

  return (
    <div role="tabpanel" className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <h3 className="font-heading text-lg leading-snug font-bold sm:text-xl">{day.title}</h3>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ModeIcon className="size-4" /> {t.trips.modes[day.mode] ?? t.trips.modes.walking} · {t.trips.stops(day.stops.length)}
          </p>
        </div>
        <DayRouteLinks routes={routes} dayNumber={dayNumber} className="w-full sm:w-auto" />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        {mapStops.length > 0 && (
          <ItineraryMap
            stops={mapStops}
            focus={focus}
            active={activeStop}
            onSelect={setActiveStop}
            className="relative isolate z-0 h-64 overflow-hidden rounded-xl ring-1 ring-foreground/10 sm:h-80 lg:sticky lg:top-4 lg:order-last lg:h-[34rem]"
          />
        )}
        <ol className="divide-y overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          {stops.map((stop, index) => (
            <ItineraryStop
              key={index}
              stop={stop}
              last={index === stops.length - 1}
              active={stop.number != null && stop.number === activeStop}
              onPick={setActiveStop}
            />
          ))}
        </ol>
      </div>
    </div>
  );
}
