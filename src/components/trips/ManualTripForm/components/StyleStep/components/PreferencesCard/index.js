"use client";

import { Sparkles } from "lucide-react";
import ItineraryPreferences from "@/components/trips/itinerary/ItineraryPreferences";
import { useI18n } from "@/context/i18n";

// Step 2's card: pace, interests and getting around, one under the other, and what the plan will hold.
// `preferences`: useItineraryPreferences of the trip.
const PreferencesCard = ({ trip, preferences, disabled }) => {
  const { texts } = useI18n();
  const labels = texts.trips.manual;
  return (
    <section className="grid gap-5 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-6">
      <div className="flex gap-3">
        <Sparkles className="mt-0.5 size-6 shrink-0 text-primary" />
        <div className="grid gap-1">
          <h2 className="font-heading text-xl font-bold tracking-tight">{labels.preferencesTitle}</h2>
          <p className="text-sm text-muted-foreground">{labels.preferencesHint}</p>
        </div>
      </div>

      <ItineraryPreferences trip={trip} preferences={preferences} disabled={disabled} stacked />

      <div className="flex gap-3 border-t pt-4">
        <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
        <div className="grid gap-0.5">
          <p className="text-sm font-semibold">{labels.planNoteTitle}</p>
          <p className="text-sm text-muted-foreground">{labels.planNoteText}</p>
        </div>
      </div>
    </section>
  );
};

export default PreferencesCard;
