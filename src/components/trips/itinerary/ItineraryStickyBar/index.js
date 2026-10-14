"use client";

import Link from "next/link";
import { ChevronLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/i18n";
import { useDayPlan } from "@/hooks/useDayPlan";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

// Phones and tablets, once the photo header has scrolled away: a slim bar fixed at the top that keeps the
// context (the day's title and the destination) and the actions at hand (back to the list, the day in
// Google Maps). It slides in while `visible`; the day tabs stick right under it (ItineraryDayTabs).
export default function ItineraryStickyBar({ trip, day, dayNumber, visible }) {
  const { lang, t } = useI18n();
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
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-2 sm:px-4">
        <Button asChild variant="ghost" size="icon" className="size-10 shrink-0">
          <Link href={ROUTES.trips(lang)} aria-label={t.trips.backToList}>
            <ChevronLeft className="size-5" />
          </Link>
        </Button>
        <div className="grid min-w-0 flex-1 leading-tight">
          <p className="truncate font-heading text-sm font-bold">{day.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {fare.city}, {fare.country}
          </p>
        </div>
        {routes.length > 0 && (
          <Button asChild variant="outline" size="sm" className="h-9 shrink-0 border-primary/60 text-primary-ink hover:text-primary-ink dark:border-primary/60">
            <a href={routes[0]} target="_blank" rel="noopener noreferrer" aria-label={t.trips.openDayRoute(dayNumber)}>
              <MapPin /> Google Maps
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
