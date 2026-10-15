"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyTrips from "@/components/trips/EmptyTrips";
import ExploreMoreLink from "@/components/trips/ExploreMoreLink";
import PastTrips from "@/components/trips/PastTrips";
import TripCard from "@/components/trips/TripCard";
import LocalTripsNotice from "@/components/trips/TripList/components/LocalTripsNotice";
import { useAuth } from "@/context/auth";
import { useI18n } from "@/context/i18n";
import { useTripGroups } from "@/hooks/useTrips";
import { ROUTES } from "@/constants/routes";

// My trips: the upcoming ones (or how to save one), then the past ones folded away.
// "Plan a trip" makes one without searching flights (ManualTripForm), with a line saying so.
// Signed out with trips, a notice says they are only in this browser.
const TripList = () => {
  const { lang, texts } = useI18n();
  const { upcoming, past } = useTripGroups();
  const { status } = useAuth();
  const onlyHere = status === "signedOut" && upcoming.length + past.length > 0;
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{texts.trips.title}</h1>
          <p className="text-muted-foreground sm:text-lg">{texts.trips.subtitle}</p>
        </div>
        <div className="grid justify-items-stretch gap-1.5 max-sm:w-full sm:justify-items-end">
          <Button asChild variant="outline" className="h-10 font-semibold">
            <Link href={ROUTES.newTrip(lang)} aria-describedby="plan-trip-hint">
              <Plus /> {texts.trips.manual.add}
            </Link>
          </Button>
          <p id="plan-trip-hint" className="max-w-64 text-xs text-muted-foreground max-sm:mx-auto max-sm:text-center sm:text-right">
            {texts.trips.manual.addHint}
          </p>
        </div>
      </div>

      {onlyHere && <LocalTripsNotice />}

      {upcoming.length ? (
        <div className="grid gap-3">
          {upcoming.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
          <ExploreMoreLink />
        </div>
      ) : (
        <EmptyTrips />
      )}

      <PastTrips trips={past} />
    </>
  );
};

export default TripList;
