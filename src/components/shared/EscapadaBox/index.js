"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import DestinationGuide from "@/components/shared/DestinationGuide";
import { useI18n } from "@/context/i18n";
import { ROUTES } from "@/constants/routes";
import { stopsParam } from "@/utils/manualTrips";
import { plannerStopsOf } from "@/utils/stopovers";

// The getaway in the hub's city: how long (2 nights · 58 h to see it), why it is worth it (its guide), and the way
// into the itinerary: the planner opens with every town of the trip (the hub, the destination, a night on the way
// back) and its flights' days and times already in. The planner link is left out when it cannot take the trip.
const EscapadaBox = ({ trip }) => {
  const { lang, texts } = useI18n();
  const results = texts.results;
  const hub = trip.stops[0];
  const hours = hub.minutes && Math.round(hub.minutes / 60);
  // Back through the same city with a night there
  const backAgain = trip.stops.slice(1).find((stop) => stop.city === hub.city && stop.nights > 0);
  const stops = plannerStopsOf(trip);
  const cities = stops && [...new Set(stops.map((stop) => stop.city))];

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 rounded-xl bg-primary/10 px-4 py-4 ring-1 ring-primary/30 sm:px-5">
      <Sparkles className="mt-0.5 size-6 text-primary" />
      <div className="grid gap-2">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-heading text-lg font-semibold">{results.escapadaIn(hub.city)}</span>
          <span className="text-muted-foreground">· {texts.units.nights(hub.nights)}</span>
          {hours && <span className="text-muted-foreground">· {results.hoursToSee(hours)}</span>}
          {backAgain && <span className="text-muted-foreground">· {results.moreOnWayBack(backAgain.nights)}</span>}
        </p>
        <DestinationGuide code={hub.code} className="pb-0" />
        {cities && (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="text-muted-foreground">{results.planQuestion}</span>
            <Link
              href={ROUTES.plannedTrip(lang, stopsParam(stops))}
              className="flex items-center gap-1.5 font-semibold text-primary-ink hover:underline focus-visible:underline focus-visible:outline-none"
            >
              {results.planAction(cities)}
              <ArrowRight className="size-4 shrink-0" />
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default EscapadaBox;
