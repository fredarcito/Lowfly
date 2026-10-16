"use client";

import { Clock } from "lucide-react";
import DestinationGuide from "@/components/shared/DestinationGuide";
import TripBackdrop from "@/components/trips/TripBackdrop";
import TripStats from "@/components/trips/TripStats";
import SaveSharedTripButton from "@/components/trips/sharing/SaveSharedTripButton";
import SharedBy from "@/components/trips/sharing/SharedBy";
import { useI18n } from "@/context/i18n";
import { STATS_CARD } from "@/components/trips/sharing/SharedTripHeader/resources/statsCard";
import { useTripWhen } from "@/hooks/useTripWhen";

// Top of a shared trip, over the destination photo like a saved trip's: who shared it, the destination,
// when it is, the trip in figures and why the destination is worth a visit. "Save to my trips" at hand.
const SharedTripHeader = ({ trip, savedTrip, owner }) => {
  const { texts } = useI18n();
  const when = useTripWhen(trip);
  const { fare } = trip;

  return (
    <div className="grid gap-3">
      <TripBackdrop trip={trip} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SharedBy owner={owner} />
        <SaveSharedTripButton trip={savedTrip} className="max-sm:hidden" />
      </div>

      <h1 className="mt-2 font-heading text-4xl leading-none font-extrabold tracking-tight drop-shadow-sm sm:text-6xl">
        {fare.city}, {fare.country}
      </h1>
      <p className="flex items-center gap-1.5 text-hero-muted sm:text-lg">
        <Clock className="size-4" />
        <span className="first-letter:uppercase">{when}</span>
      </p>

      <TripStats
        fare={fare}
        stops={trip.manual ? trip.stops : null}
        priceLabel={texts.share.priceLabel}
        className={STATS_CARD}
      />
      <SaveSharedTripButton trip={savedTrip} className="sm:hidden" />

      {/* Through several towns, the description of one of them would mislead. Phones: room on the right for the
          photo's © in the corner, next to "See more" */}
      {fare.code && (!trip.manual || trip.stops.length === 1) && (
        <DestinationGuide code={fare.code} foldOnPhones plainTags className="mt-1 max-w-[60ch] pb-0 max-sm:pr-8" textClassName="text-hero-muted sm:text-base" />
      )}
    </div>
  );
};

export default SharedTripHeader;
