"use client";

import Link from "next/link";
import { Luggage, Plane, PlaneTakeoff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/i18n";
import { ROUTES } from "@/constants/routes";

// No upcoming trips: a small illustration (suitcase and plane) and the way to find one
export default function EmptyTrips() {
  const { lang, t } = useI18n();
  return (
    <div className="grid items-center justify-items-center gap-6 rounded-xl bg-card px-6 py-10 text-center ring-1 ring-foreground/10 sm:grid-cols-[auto_auto] sm:justify-center sm:gap-10 sm:text-left">
      <div aria-hidden className="relative px-6 pt-4">
        <Luggage className="size-20 text-muted-foreground" strokeWidth={1.1} />
        <Plane className="absolute top-0 -right-1 size-7 text-primary" />
        <span className="absolute top-6 right-4 h-8 w-6 rounded-tr-full border-t-2 border-r-2 border-dashed border-muted-foreground/50" />
      </div>
      <div className="grid justify-items-center gap-2 sm:justify-items-start sm:border-l sm:pl-10">
        <p className="font-heading text-xl font-bold">{t.trips.empty}</p>
        <p className="max-w-[44ch] text-sm text-muted-foreground">{t.trips.emptyHint}</p>
        <Button asChild variant="outline" className="mt-2 h-10 rounded-full px-5 font-semibold">
          <Link href={ROUTES.home(lang)}>
            <PlaneTakeoff /> {t.trips.exploreFlights}
          </Link>
        </Button>
      </div>
    </div>
  );
}
