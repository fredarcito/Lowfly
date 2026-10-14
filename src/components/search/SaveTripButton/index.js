"use client";

import Link from "next/link";
import { ArrowRight, Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/i18n";
import { removeTrip, saveTrip, tripId } from "@/store/trips";
import { useTrips } from "@/hooks/useTrips";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

// Saves the flight to "My trips". Once saved, the full button becomes "View in My trips" (to the trip and
// its itinerary) with a small bookmark next to it to remove it. `fare` needs city and country.
// compact: just the icon, for small spaces such as the photo of a weekend card.
const SaveTripButton = ({ origin, fare, compact = false, className }) => {
  const { lang, t } = useI18n();
  const id = tripId(origin, fare);
  const saved = useTrips().some((trip) => trip.id === id);
  const Icon = saved ? BookmarkCheck : Bookmark;
  const toggle = () => (saved ? removeTrip(id) : saveTrip(origin, fare));

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-pressed={saved}
        aria-label={saved ? t.trips.savedAria : t.trips.save}
        title={saved ? t.trips.saved : t.trips.save}
        className={cn(
          "grid size-8 place-items-center rounded-full backdrop-blur-sm transition-colors focus-visible:ring-3 focus-visible:ring-white/60 focus-visible:outline-none",
          saved ? "bg-primary text-primary-foreground" : "bg-black/45 text-white hover:bg-black/65",
          className
        )}
      >
        <Icon className="size-4" />
      </button>
    );
  }

  if (saved) {
    return (
      <div className={cn("flex gap-2", className)}>
        <Button asChild variant="outline" size="lg" className="h-full min-h-11 flex-1 border-primary/40 bg-selected px-5 text-base text-primary-ink hover:bg-selected/80 hover:text-primary-ink">
          <Link href={ROUTES.trip(lang, id)}>
            {t.trips.viewInTrips} <ArrowRight />
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={toggle}
          aria-pressed
          aria-label={t.trips.unsave}
          title={t.trips.unsave}
          className="size-auto min-h-11 w-11 shrink-0 border-primary/40 text-primary-ink"
        >
          <BookmarkCheck />
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={toggle}
      aria-pressed={false}
      className={cn("h-11 px-5 text-base", className)}
    >
      <Icon /> {t.trips.save}
    </Button>
  );
};

export default SaveTripButton;
