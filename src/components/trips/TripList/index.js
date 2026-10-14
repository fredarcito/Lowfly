"use client";

import EmptyTrips from "@/components/trips/EmptyTrips";
import ExploreMoreLink from "@/components/trips/ExploreMoreLink";
import PastTrips from "@/components/trips/PastTrips";
import TripCard from "@/components/trips/TripCard";
import { useI18n } from "@/context/i18n";
import { useTripGroups } from "@/hooks/useTrips";

// My trips: the upcoming ones (or how to save one), then the past ones folded away
export default function TripList() {
  const { t } = useI18n();
  const { upcoming, past } = useTripGroups();
  return (
    <>
      <div className="grid gap-1">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{t.trips.title}</h1>
        <p className="text-muted-foreground sm:text-lg">{t.trips.subtitle}</p>
      </div>

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
}
