"use client";

import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ErrorNote from "@/components/shared/ErrorNote";
import ItineraryPreferences from "@/components/trips/itinerary/ItineraryPreferences";
import SignInToCreate from "@/components/trips/itinerary/SignInToCreate";
import { useI18n } from "@/context/i18n";
import { useItineraryPreferences } from "@/components/trips/itinerary/CreateItinerary/hooks/useItineraryPreferences";
import { useNeedsAccount } from "@/components/trips/itinerary/CreateItinerary/hooks/useNeedsAccount";
import { ROUTES } from "@/constants/routes";

// No itinerary yet: what the AI makes, the visitor's preferences and the button to create it.
// Same layout as the search form: labelled fields in equal columns, then a note and the button.
// `creation`: { status: "idle" | "creating" | "error", error } while the AI works on it
const CreateItinerary = ({ trip, onCreate, creation }) => {
  const { lang, texts } = useI18n();
  const needsAccount = useNeedsAccount(creation.error);
  const preferences = useItineraryPreferences(trip);
  const { fare } = trip;
  const nights = fare.ret ? fare.nights : 0;
  const creating = creation.status === "creating";

  return (
    <section className="grid gap-5 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-6">
      <div className="flex gap-3">
        <Sparkles className="mt-0.5 size-6 shrink-0 text-primary-ink" />
        <div className="grid gap-0.5">
          <h2 className="font-heading text-xl font-bold tracking-tight">{texts.trips.aiTitle(nights + 1, fare.city)}</h2>
          <p className="max-w-[65ch] text-sm text-muted-foreground">{texts.trips.aiText(nights, trip.manual && trip.stops.length > 1)}</p>
        </div>
      </div>

      <ItineraryPreferences trip={trip} preferences={preferences} disabled={creating} />

      {creation.status === "error" && !needsAccount && <ErrorNote error={creation.error} />}

      {needsAccount ? (
        <SignInToCreate next={ROUTES.trip(lang, trip.id)} />
      ) : (
        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {creating ? texts.trips.aiCreating : texts.trips.aiNote}
          </p>
          <Button size="lg" disabled={creating} className="h-11 shrink-0 px-6 text-base font-bold" onClick={() => onCreate(preferences.preferences)}>
            {creating ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {creating ? texts.trips.aiGenerating : texts.trips.aiGenerate}
          </Button>
        </div>
      )}
    </section>
  );
};

export default CreateItinerary;
