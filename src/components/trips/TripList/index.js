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
          {/* Desktop: one small line, part of the header */}
          {onlyHere && <LocalTripsNotice inline className="mt-1.5 max-md:hidden" />}
        </div>
        {/* Planning a trip by hand, outlined (coral is for each trip's itinerary). Phones and tablets: what it
            does, then the button across; desktop: the button beside the title, the line under it */}
        <div className="grid gap-2 max-md:w-full md:justify-items-end md:gap-1.5">
          <p id="plan-trip-hint" className="text-sm text-muted-foreground md:order-2 md:max-w-64 md:text-right md:text-xs">
            {texts.trips.manual.addHint}
          </p>
          <Button asChild variant="outline" className="group h-12 font-semibold md:order-1 md:h-10">
            <Link href={ROUTES.newTrip(lang)} aria-describedby="plan-trip-hint">
              <Plus className="transition-transform duration-300 group-hover:rotate-90" /> {texts.trips.manual.add}
            </Link>
          </Button>
        </div>
      </div>

      {onlyHere && <LocalTripsNotice className="md:hidden" />}

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
