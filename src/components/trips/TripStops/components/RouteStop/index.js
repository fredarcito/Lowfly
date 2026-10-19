"use client";

import { LogIn, LogOut } from "lucide-react";
import StopMoment from "@/components/trips/TripStops/components/RouteStop/components/StopMoment";
import StayLength from "@/components/trips/TripStops/components/StayLength";
import { useI18n } from "@/context/i18n";
import { flag } from "@/utils/format";

// One town of the route: its number, name and country, how long they stay (nights, hours or passing through), and
// arriving and leaving side by side
const RouteStop = ({ stop, number }) => {
  const { texts } = useI18n();
  return (
    <li className="grid min-w-0 grid-cols-1 content-start gap-3 rounded-lg bg-muted/50 p-4">
      <div className="flex items-center gap-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {number}
        </span>
        <p title={stop.city} className="min-w-0 flex-1 truncate font-heading font-bold">
          {stop.city}{" "}
          <span className="font-sans text-sm font-normal text-muted-foreground">
            {flag(stop.countryCode)} {stop.country}
          </span>
        </p>
        <span className="shrink-0 rounded-full bg-background/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          <StayLength stop={stop} />
        </span>
      </div>
      <dl className="grid grid-cols-2 divide-x pl-10">
        <StopMoment icon={LogIn} label={texts.trips.arrival} moment={stop.arrive} />
        <div className="pl-4">
          <StopMoment icon={LogOut} label={texts.trips.leaving} moment={stop.leave} />
        </div>
      </dl>
    </li>
  );
};

export default RouteStop;
