"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Ticket } from "lucide-react";
import DestinationGuide from "@/components/shared/DestinationGuide";
import TripBackdrop from "@/components/trips/TripBackdrop";
import TripMenu from "@/components/trips/TripMenu";
import { useI18n } from "@/context/i18n";
import { useTripWhen } from "@/hooks/useTripWhen";
import { ROUTES } from "@/constants/routes";

// Top of a trip, over the destination photo: back to the list, destination, dates, nights and when it is,
// why the destination is worth a visit, and the ⋯ menu
const TripHeader = ({ trip, onDeleted }) => {
  const { lang, texts, format } = useI18n();
  const when = useTripWhen(trip);
  const { fare } = trip;
  const dates = fare.ret ? format.fmtRange(fare.day, fare.ret.day) : format.fmtDay(fare.day);

  return (
    <div className="grid gap-3">
      <TripBackdrop code={fare.code} />

      <div className="flex items-start justify-between gap-4">
        <Link
          href={ROUTES.trips(lang)}
          className="mt-2 flex w-fit items-center gap-1.5 text-sm font-medium text-hero-muted hover:text-hero-foreground"
        >
          <ArrowLeft className="size-4" /> {texts.trips.backToList}
        </Link>
        {/* Round and on glass like the theme button above it, so it shows over the photo */}
        <TripMenu
          trip={trip}
          onDeleted={onDeleted}
          variant="ghost"
          className="rounded-full bg-hero-chip text-hero-foreground backdrop-blur-sm hover:bg-hero-chip hover:text-hero-foreground aria-expanded:bg-hero-chip dark:hover:bg-hero-chip"
        />
      </div>

      <h1 className="font-heading text-4xl leading-none font-extrabold tracking-tight drop-shadow-sm sm:text-6xl">
        {fare.city}, {fare.country}
      </h1>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-hero-muted sm:text-lg">
        <span className="first-letter:uppercase">
          {dates}
          {fare.ret && ` · ${texts.units.nights(fare.nights)}`}
        </span>
        <span aria-hidden>·</span>
        <span className="flex items-center gap-1.5">
          <Clock className="size-4" />
          <span className="first-letter:uppercase">{when}</span>
        </span>
        {trip.booked && (
          <>
            <span aria-hidden>·</span>
            <span className="flex items-center gap-1.5 text-save">
              <Ticket className="size-4" /> {texts.trips.booked}
            </span>
          </>
        )}
      </p>

      {/* Through several towns, the description of one of them would mislead */}
      {fare.code && (!trip.manual || trip.stops.length === 1) && <DestinationGuide code={fare.code} className="mt-1 max-w-[60ch] pb-0" textClassName="text-hero-muted sm:text-base" />}
    </div>
  );
};

export default TripHeader;
