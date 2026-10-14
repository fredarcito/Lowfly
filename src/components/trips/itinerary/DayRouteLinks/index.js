"use client";

import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/i18n";
import { cn } from "@/utils/cn";

// "Open day 1 in Google Maps" (the app on phones). A long day is split into routes of up to 11 points.
export default function DayRouteLinks({ routes, dayNumber, className }) {
  const { t } = useI18n();
  if (!routes.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {routes.map((href, legIndex) => (
        <Button key={href} asChild className="h-11 flex-1 px-5 font-bold sm:flex-none">
          <a href={href} target="_blank" rel="noopener noreferrer">
            <MapPin />
            {routes.length > 1 ? t.trips.openDayRouteLeg(dayNumber, legIndex + 1, routes.length) : t.trips.openDayRoute(dayNumber)}
          </a>
        </Button>
      ))}
    </div>
  );
}
