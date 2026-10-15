"use client";

import { LogIn, LogOut, Moon } from "lucide-react";
import StopMoment from "@/components/trips/TripStops/components/RouteStop/components/StopMoment";
import { useI18n } from "@/context/i18n";
import { nightsBetween } from "@/utils/dates";
import { flag } from "@/utils/format";

// One town of the route: its number, name and country, the nights there, and arriving and leaving side by side
const RouteStop = ({ stop, number }) => {
  const { texts } = useI18n();
  const nights = nightsBetween(stop.arrive.day, stop.leave.day);
  return (
    <li className="grid min-w-0 grid-cols-1 gap-3 rounded-lg bg-muted/50 p-4">
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
        {nights > 0 && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-background/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            <Moon className="size-3" /> {texts.units.nights(nights)}
          </span>
        )}
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
