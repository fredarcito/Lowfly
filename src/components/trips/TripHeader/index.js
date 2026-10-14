"use client";

import { Bookmark, Clock, Sparkles, Ticket } from "lucide-react";
import TripChip from "@/components/trips/TripChip";
import TripMenu from "@/components/trips/TripMenu";
import TripPhoto from "@/components/trips/TripPhoto";
import { useI18n } from "@/context/i18n";
import { useTripWhen } from "@/hooks/useTripWhen";

// Top of a trip: photo, destination, dates and nights, its state, and the ⋯ menu
export default function TripHeader({ trip, onDeleted }) {
  const { t, f } = useI18n();
  const when = useTripWhen(trip);
  const { fare, itinerary } = trip;
  const dates = fare.ret ? f.fmtRange(fare.day, fare.ret.day) : f.fmtDay(fare.day);

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 sm:gap-6">
      <TripPhoto code={fare.code} className="size-20 rounded-xl sm:h-32 sm:w-48" />
      <div className="grid gap-1.5">
        <h1 className="font-heading text-2xl leading-tight font-extrabold tracking-tight sm:text-4xl">
          {fare.city}, {fare.country}
        </h1>
        <p className="text-muted-foreground first-letter:uppercase sm:text-lg">
          {dates}
          {fare.ret && ` · ${t.units.nights(fare.nights)}`}
        </p>
        {/* On phones only the itinerary label shows: the rest is in the trip list */}
        <div className="flex flex-wrap items-center gap-1.5">
          {trip.booked ? (
            <TripChip icon={Ticket} className="bg-save/15 text-save max-sm:hidden">
              {t.trips.booked}
            </TripChip>
          ) : (
            <TripChip icon={Bookmark} className="max-sm:hidden">
              {t.trips.saved}
            </TripChip>
          )}
          <TripChip icon={Clock} className="max-sm:hidden">
            <span className="first-letter:uppercase">{when}</span>
          </TripChip>
          {itinerary && (
            <TripChip icon={Sparkles} className="bg-selected text-primary-ink">
              {itinerary.source === "ai" ? t.trips.aiBadge : itinerary.source === "sample-other-city" ? t.trips.sampleOtherBadge : t.trips.sampleBadge}
            </TripChip>
          )}
        </div>
      </div>
      <div className="self-start">
        <TripMenu trip={trip} onDeleted={onDeleted} />
      </div>
    </div>
  );
}
