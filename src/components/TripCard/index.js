"use client";

import Link from "next/link";
import { ArrowRight, Bookmark, Clock, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import AirlineBadge from "@/components/AirlineBadge";
import TripChip from "@/components/TripChip";
import TripMenu from "@/components/TripMenu";
import TripPhoto from "@/components/TripPhoto";
import TripRoute from "@/components/TripRoute";
import TripStats from "@/components/TripStats";
import { useI18n } from "@/context/i18n";
import { useTripWhen } from "@/hooks/useTripWhen";
import { airlinesOf } from "@/utils/format";
import { ROUTES } from "@/constants/routes";

// Booked or only saved, when it is and the airlines
function TripBadges({ trip }) {
  const { t } = useI18n();
  const when = useTripWhen(trip);
  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1">
      {trip.booked ? (
        <TripChip icon={Ticket} className="bg-save/15 text-save">
          {t.trips.booked}
        </TripChip>
      ) : (
        <TripChip icon={Bookmark}>{t.trips.saved}</TripChip>
      )}
      <TripChip icon={Clock}>
        <span className="first-letter:uppercase">{when}</span>
      </TripChip>
      {airlinesOf(trip.fare).map((airline) => (
        <AirlineBadge key={airline} airline={airline} />
      ))}
    </div>
  );
}

// A saved trip in the list. Phone: photo on top, then the trip, its figures and the actions.
// Tablet and up: photo on the left; trip and actions on top, figures below.
// The whole card opens the trip; the button and the ⋯ menu sit above that link.
export default function TripCard({ trip }) {
  const { lang, t } = useI18n();
  const { fare, origin } = trip;
  const href = ROUTES.trip(lang, trip.id);

  return (
    <article className="group relative grid overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow [grid-template-areas:'photo''info''stats''actions'] hover:shadow-lg hover:ring-foreground/20 md:grid-cols-[11rem_minmax(0,1fr)_auto] md:[grid-template-areas:'photo_info_actions''photo_stats_stats'] lg:grid-cols-[13rem_minmax(0,1fr)_auto]">
      <TripPhoto code={fare.code} className="h-40 [grid-area:photo] md:m-3 md:mr-0 md:h-auto md:rounded-lg" />

      <div className="grid content-start gap-2 px-4 pt-4 [grid-area:info] md:px-5">
        <h2 className="font-heading text-xl leading-tight font-bold tracking-tight sm:text-2xl">
          <Link
            href={href}
            className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
          >
            {fare.city}, {fare.country}
          </Link>
        </h2>
        <TripRoute origin={origin} fare={fare} />
        <TripBadges trip={trip} />
      </div>

      <TripStats fare={fare} className="px-4 pt-4 [grid-area:stats] md:px-5 md:pb-4" />

      <div className="relative z-10 flex items-start gap-2 p-4 [grid-area:actions] md:pl-0">
        <Button asChild className="h-10 flex-1 font-bold md:flex-none">
          <Link href={href}>
            {trip.itinerary ? t.trips.viewItinerary : t.trips.createItinerary}
            <ArrowRight />
          </Link>
        </Button>
        <TripMenu trip={trip} />
      </div>
    </article>
  );
}
