"use client";

import { Fragment, useState } from "react";
import { Car, CircleCheck, Footprints, TrainFront } from "lucide-react";
import DayRouteLinks from "@/components/trips/itinerary/DayRouteLinks";
import ItineraryMap from "@/components/trips/itinerary/ItineraryMap";
import ItineraryStop from "@/components/trips/itinerary/ItineraryStop";
import ItineraryPeriod from "@/components/trips/itinerary/ItineraryPeriod";
import { useI18n } from "@/context/i18n";
import { useDayPlan } from "@/hooks/useDayPlan";
import { useVisitedStops } from "@/hooks/useVisitedStops";

const MODE_ICONS = { walking: Footprints, driving: Car, transit: TrainFront };

// One day: title, progress and the Maps route; then the stops (grouped into morning, afternoon and night)
// next to the map (desktop) or under it (phone). One stop is open at a time, in step with the map.
const ItineraryDay = ({ trip, day, dayNumber }) => {
  const { t } = useI18n();
  const { stops, mapStops, routes } = useDayPlan(day);
  const { isVisited, toggleVisited, countIn } = useVisitedStops(trip);
  const [openId, setOpenId] = useState(null);
  const [hoveredNumber, setHoveredNumber] = useState(null);
  const ModeIcon = MODE_ICONS[day.mode] ?? Footprints;
  const places = stops.filter((stop) => stop.place);
  const openStop = stops.find((stop) => stop.id === openId);

  // From a pin: open its stop and bring it into view
  const openNumber = (number) => {
    const stop = stops.find((candidate) => candidate.number === number);
    if (!stop) return;
    setOpenId(stop.id);
    document.getElementById(`stop-${stop.id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  // The timeline runs from the first stop's marker to the last one's
  const lastIndex = stops.length - 1;

  return (
    <div role="tabpanel" className="grid grid-cols-1 gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <h3 className="font-heading text-lg leading-snug font-bold sm:text-xl">{day.title}</h3>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ModeIcon className="size-4" /> {t.trips.modes[day.mode] ?? t.trips.modes.walking} · {t.trips.stops(stops.length)}
            </span>
            {places.length > 0 && (
              <span className="flex items-center gap-1.5">
                <CircleCheck className="size-4" /> {t.trips.visitedCount(countIn(places), places.length)}
              </span>
            )}
          </p>
        </div>
        <DayRouteLinks routes={routes} dayNumber={dayNumber} className="w-full sm:w-auto" />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        {mapStops.length > 0 && (
          <ItineraryMap
            stops={mapStops}
            active={hoveredNumber ?? openStop?.number}
            visited={places.filter((stop) => stop.number && isVisited(stop.id)).map((stop) => stop.number)}
            onSelect={openNumber}
            className="relative isolate z-0 h-64 overflow-hidden rounded-xl ring-1 ring-foreground/10 sm:h-80 lg:sticky lg:top-20 lg:order-last lg:h-[calc(100dvh-6rem)] lg:max-h-[38rem]"
          />
        )}
        <ol className="overflow-hidden rounded-xl bg-card py-1 ring-1 ring-foreground/10">
          {stops.map((stop, index) => {
            const startsPeriod = stop.period && stop.period !== stops[index - 1]?.period;
            return (
              <Fragment key={stop.id}>
                {startsPeriod && <ItineraryPeriod period={stop.period} lineAbove={index > 0} lineBelow />}
                <ItineraryStop
                  stop={stop}
                  mode={day.mode}
                  open={stop.id === openId}
                  visited={isVisited(stop.id)}
                  onToggle={() => setOpenId((current) => (current === stop.id ? null : stop.id))}
                  onHover={setHoveredNumber}
                  onToggleVisited={() => toggleVisited(stop.id)}
                  lineAbove={index > 0 || startsPeriod}
                  lineBelow={index < lastIndex}
                />
              </Fragment>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

export default ItineraryDay;
