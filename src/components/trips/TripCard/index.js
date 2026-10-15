"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import TripMenu from "@/components/trips/TripMenu";
import TripPhoto from "@/components/trips/TripPhoto";
import TripRoute from "@/components/trips/TripRoute";
import TripStats from "@/components/trips/TripStats";
import { useI18n } from "@/context/i18n";
import { useLocalizedTrip } from "@/hooks/useLocalizedTrip";
import { ROUTES } from "@/constants/routes";
import TripBadges from "@/components/trips/TripCard/components/TripBadges";

// A saved trip in the list. Phone: photo on top, then the trip, its figures and the actions.
// Tablet and up: photo on the left; trip and actions on top, figures below.
// The whole card opens the trip; the button and the ⋯ menu sit above that link.
const TripCard = ({ trip: savedTrip }) => {
  const { lang, texts } = useI18n();
  const trip = useLocalizedTrip(savedTrip);
  const { fare, origin } = trip;
  const href = ROUTES.trip(lang, trip.id);

  return (
    <article className="group relative grid overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow [grid-template-areas:'photo''info''stats''actions'] hover:shadow-lg hover:ring-foreground/20 md:grid-cols-[11rem_minmax(0,1fr)_auto] md:[grid-template-areas:'photo_info_actions''photo_stats_stats'] lg:grid-cols-[13rem_minmax(0,1fr)_auto]">
      <TripPhoto trip={trip} className="h-40 [grid-area:photo] md:m-3 md:mr-0 md:h-auto md:rounded-lg" />

      <div className="grid content-start gap-2 px-4 pt-4 [grid-area:info] md:px-5">
        <h2 className="font-heading text-xl leading-tight font-bold tracking-tight sm:text-2xl">
          <Link
            href={href}
            className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
          >
            {fare.city}, {fare.country}
          </Link>
        </h2>
        {!trip.manual && <TripRoute origin={origin} fare={fare} />}
        <TripBadges trip={trip} />
      </div>

      <TripStats fare={fare} stops={trip.stops} className="px-4 pt-4 [grid-area:stats] md:px-5 md:pb-4" />

      <div className="relative z-10 flex items-start gap-2 p-4 [grid-area:actions] md:pl-0">
        <Button asChild className="h-10 flex-1 font-bold md:flex-none">
          <Link href={href}>
            {trip.itinerary ? texts.trips.viewItinerary : texts.trips.createItinerary}
            <ArrowRight />
          </Link>
        </Button>
        <TripMenu trip={trip} />
      </div>
    </article>
  );
};

export default TripCard;
