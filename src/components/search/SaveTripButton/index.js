"use client";

import Link from "next/link";
import { ArrowRight, Bookmark, BookmarkCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/i18n";
import { removeTrip, saveTrip, tripId } from "@/store/trips";
import { useTrips } from "@/hooks/useTrips";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";
import SaveHint from "@/components/search/SaveTripButton/components/SaveHint";

// Saves the flight to "My trips", saying under it that we plan the day-by-day itinerary too. Once saved it
// offers it, without forcing it: "✨ Plan my itinerary" (or "See my itinerary →" once made) opens the trip, and
// the bookmark next to it removes it. `fare` needs city and country; `className` sizes the buttons' row.
// compact: just the icon, for small spaces such as the photo of a weekend card. A trip through a hub (`fare.legs`)
// is saved with its towns (`stops`, useStopoverStops): until they are known, the button waits. `hint` false: without
// the line under it (where the itinerary is already offered next to it).
const SaveTripButton = ({ origin, fare, stops = null, compact = false, hint = true, className }) => {
  const { lang, texts } = useI18n();
  const id = tripId(origin, fare);
  const savedTrip = useTrips().find((trip) => trip.id === id);
  const saved = Boolean(savedTrip);
  const Icon = saved ? BookmarkCheck : Bookmark;
  const waiting = Boolean(fare.legs) && !stops;
  const toggle = () => (saved ? removeTrip(id) : saveTrip(origin, fare, stops));

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-pressed={saved}
        aria-label={saved ? texts.trips.savedAria : texts.trips.save}
        title={saved ? texts.trips.saved : texts.trips.save}
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
    const ready = Boolean(savedTrip.itinerary);
    return (
      <div className="grid w-full min-w-0 grid-cols-1 gap-1.5">
        <div className={cn("flex gap-2", className)}>
          <Button asChild variant="outline" size="lg" className="h-full min-h-11 min-w-0 flex-1 shrink gap-1.5 border-primary/40 bg-selected px-2.5 text-base lg:text-sm text-primary-ink hover:bg-selected/80 hover:text-primary-ink">
            <Link href={ROUTES.trip(lang, id)}>
              {/* Narrow columns: the sparkles lead, the arrow only when it fits */}
              {ready ? <ArrowRight className="order-last" /> : <Sparkles />}
              <span className="truncate">{ready ? texts.trips.viewMyItinerary : texts.trips.prepareItinerary}</span>
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggle}
            aria-pressed
            aria-label={texts.trips.unsave}
            title={texts.trips.unsave}
            className="size-auto min-h-11 w-11 shrink-0 border-primary/40 text-primary-ink lg:w-10"
          >
            <BookmarkCheck />
          </Button>
        </div>
        {hint && <SaveHint>{ready ? texts.trips.savedReady : texts.trips.savedHint}</SaveHint>}
      </div>
    );
  }

  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={toggle}
        aria-pressed={false}
        disabled={waiting}
        className={cn("h-11 px-5 text-base", className)}
      >
        <Icon /> {texts.trips.save}
      </Button>
      {hint && <SaveHint>{texts.trips.saveHint}</SaveHint>}
    </div>
  );
};

export default SaveTripButton;
