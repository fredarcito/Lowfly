"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/I18nProvider";
import { removeTrip, saveTrip, tripId, useTrips } from "@/lib/trips";
import { cn } from "@/lib/utils";

// Saves the flight to "My trips" (and removes it on a second press). `fare` needs city and country.
// compact: just the icon, for small spaces such as the photo of a weekend card.
export default function SaveTripButton({ origin, fare, compact = false, className }) {
  const { t } = useI18n();
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

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? t.trips.savedAria : undefined}
      className={cn("h-11 px-5 text-base", saved && "border-primary/40 bg-selected text-primary-ink", className)}
    >
      <Icon /> {saved ? t.trips.saved : t.trips.save}
    </Button>
  );
}
