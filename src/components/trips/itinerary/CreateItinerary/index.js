"use client";

import { Gauge, Sparkles, TrainFront, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import PreferencePicker from "@/components/trips/itinerary/PreferencePicker";
import { useI18n } from "@/context/i18n";
import { useItineraryPreferences } from "@/hooks/useItineraryPreferences";
import { INTERESTS, PACES, TRANSPORTS } from "@/constants/itineraryPreferences";

// No itinerary yet: what the AI makes, the visitor's preferences and the button to create it.
// Same layout as the search form: labelled fields in equal columns, then a note and the button.
export default function CreateItinerary({ trip, onCreate }) {
  const { t } = useI18n();
  const { preferences, setPace, setTransport, toggleInterest } = useItineraryPreferences(trip);
  const { fare } = trip;
  const nights = fare.ret ? fare.nights : 0;
  const labels = t.trips.preferences;
  const optionsOf = (ids, names) => ids.map((id) => ({ id, label: names[id] }));

  return (
    <section className="grid gap-5 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-6">
      <div className="flex gap-3">
        <Sparkles className="mt-0.5 size-6 shrink-0 text-primary-ink" />
        <div className="grid gap-0.5">
          <h2 className="font-heading text-xl font-bold tracking-tight">{t.trips.aiTitle(nights + 1, fare.city)}</h2>
          <p className="max-w-[65ch] text-sm text-muted-foreground">{t.trips.aiText(nights)}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <PreferencePicker
          id="pace"
          icon={Gauge}
          label={labels.pace}
          options={optionsOf(PACES, labels.paces)}
          value={preferences.pace}
          onChange={setPace}
        />
        <PreferencePicker
          id="interests"
          icon={Utensils}
          label={labels.interests}
          options={optionsOf(INTERESTS, labels.interestNames)}
          values={preferences.interests}
          onToggle={toggleInterest}
        />
        <PreferencePicker
          id="transport"
          icon={TrainFront}
          label={labels.transport}
          options={optionsOf(TRANSPORTS, labels.transports)}
          value={preferences.transport}
          onChange={setTransport}
        />
      </div>

      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{t.trips.aiSampleForNow}</p>
        <Button size="lg" className="h-11 shrink-0 px-6 text-base font-bold" onClick={() => onCreate(preferences)}>
          <Sparkles /> {t.trips.aiGenerate}
        </Button>
      </div>
    </section>
  );
}
