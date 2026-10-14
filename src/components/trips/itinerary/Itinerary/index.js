"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateItinerary from "@/components/trips/itinerary/CreateItinerary";
import ItineraryDay from "@/components/trips/itinerary/ItineraryDay";
import ItineraryDayTabs from "@/components/trips/itinerary/ItineraryDayTabs";
import { useI18n } from "@/context/i18n";
import { useItinerary } from "@/hooks/useItinerary";

// The trip's day-by-day plan (day tabs, then the picked day), or the button to create it
export default function Itinerary({ trip }) {
  const { t } = useI18n();
  const { itinerary, days, day, dayIndex, pickDay, create } = useItinerary(trip);
  if (!itinerary) return <CreateItinerary trip={trip} onCreate={create} />;

  return (
    <section className="grid gap-4">
      <ItineraryDayTabs days={days} picked={dayIndex} onPick={pickDay} />
      {itinerary.source !== "ai" && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          <p>{itinerary.source === "sample-other-city" ? t.trips.sampleOtherCity(trip.fare.city) : t.trips.sampleNote}</p>
          <Button variant="ghost" size="sm" onClick={() => create(trip.preferences)} className="text-muted-foreground">
            <RefreshCw /> {t.trips.regenerate}
          </Button>
        </div>
      )}
      <ItineraryDay key={day.date} day={day} dayNumber={dayIndex + 1} />
    </section>
  );
}
