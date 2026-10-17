"use client";

import Link from "next/link";
import { ChevronLeft, MapPin, Signpost } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/i18n";
import { useDayPlan } from "@/hooks/useDayPlan";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

// Phones and tablets, once the photo header has scrolled away: a slim bar fixed at the top that keeps the
// context (the day's title and the destination, or the day trip) and the actions at hand (back to the list, the day in
// Google Maps). It slides in while `visible`; the day tabs stick right under it (ItineraryDayTabs).
// `readOnly` (a shared trip): there is no list to go back to.
const ItineraryStickyBar = ({ trip, day, dayNumber, visible, readOnly = false }) => {
  const { lang, texts, format } = useI18n();
  const { routes } = useDayPlan(day);
  const { fare } = trip;

  return (
    <div
      aria-hidden={!visible}
      inert={!visible}
      className={cn(
        "fixed inset-x-0 top-0 z-30 border-b bg-background/90 pt-[env(safe-area-inset-top,0px)] backdrop-blur-md transition-transform duration-300 ease-out motion-reduce:transition-none lg:hidden",
        visible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className={cn("mx-auto flex h-14 max-w-5xl items-center gap-2 px-2 sm:px-4", readOnly && "px-4 sm:px-6")}>
        {!readOnly && (
          <Button asChild variant="ghost" size="icon" className="size-10 shrink-0">
            <Link href={ROUTES.trips(lang)} aria-label={texts.trips.backToList}>
              <ChevronLeft className="size-5" />
            </Link>
          </Button>
        )}
        <div className="grid min-w-0 flex-1 leading-tight">
          <p className="truncate font-heading text-sm font-bold">{day.title}</p>
          {/* A day trip keeps saying so while scrolling; any other day, where the trip is */}
          {day.excursion ? (
            <p className="flex min-w-0 items-center gap-1 text-xs font-semibold text-sea">
              <Signpost className="size-3 shrink-0" />
              {/* A long town name is cut, never how long it takes */}
              <span className="truncate">{texts.trips.excursionTo(texts.trips.excursionRoute(day.excursion.town, day.excursion.via))}</span>
              {/* "55 min away": how far it is, not how long the trip lasts */}
              <span className="shrink-0">· {texts.trips.excursionAway(format.duration(day.excursion.travelMinutes))}</span>
            </p>
          ) : (
            <p className="truncate text-xs text-muted-foreground">
              {fare.city}, {fare.country}
            </p>
          )}
        </div>
        {routes.length > 0 && (
          <Button asChild variant="outline" size="sm" className="h-9 shrink-0 border-primary/60 text-primary-ink hover:text-primary-ink dark:border-primary/60">
            <a href={routes[0]} target="_blank" rel="noopener noreferrer" aria-label={texts.trips.openDayRoute(dayNumber)}>
              <MapPin /> Google Maps
            </a>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ItineraryStickyBar;
