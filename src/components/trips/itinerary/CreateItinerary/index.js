"use client";

import { Compass, Gauge, Sparkles, TrainFront, Utensils, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import PreferencePicker from "@/components/trips/itinerary/PreferencePicker";
import { useI18n } from "@/context/i18n";
import { useItineraryPreferences } from "@/hooks/useItineraryPreferences";
import { INTERESTS, PACES, TRANSPORTS } from "@/constants/itineraryPreferences";

// No itinerary yet: what the AI makes, the visitor's preferences and the button to create it
export default function CreateItinerary({ trip, onCreate }) {
  const { t } = useI18n();
  const { preferences, setPace, setTransport, toggleInterest } = useItineraryPreferences(trip);
  const { fare } = trip;
  const nights = fare.ret ? fare.nights : 0;
  const labels = t.trips.preferences;
  const optionsOf = (ids, names) => ids.map((id) => ({ id, label: names[id] }));

  return (
    <section className="grid justify-items-center gap-5 rounded-2xl bg-card px-5 py-8 text-center ring-1 ring-foreground/10 sm:px-8 sm:py-10">
      {/* Illustration: a magic wand and a compass with sparkles */}
      <div aria-hidden className="relative grid size-28 place-items-center rounded-full bg-muted/60">
        <WandSparkles className="absolute top-6 left-5 size-10 -rotate-12" strokeWidth={1.5} />
        <Compass className="absolute right-4 bottom-6 size-11 text-primary" strokeWidth={1.5} />
        <Sparkles className="absolute -top-1 right-6 size-5 text-primary" />
      </div>

      <div className="grid max-w-[60ch] gap-2">
        <h2 className="font-heading text-2xl leading-tight font-extrabold tracking-tight text-balance sm:text-3xl">
          {t.trips.aiTitle(nights + 1, fare.city)}
        </h2>
        <p className="text-muted-foreground sm:text-lg">{t.trips.aiText(nights)}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <PreferencePicker
          icon={Gauge}
          label={labels.pace}
          options={optionsOf(PACES, labels.paces)}
          value={preferences.pace}
          onChange={setPace}
        />
        <PreferencePicker
          icon={Utensils}
          label={labels.interests}
          options={optionsOf(INTERESTS, labels.interestNames)}
          values={preferences.interests}
          onToggle={toggleInterest}
        />
        <PreferencePicker
          icon={TrainFront}
          label={labels.transport}
          options={optionsOf(TRANSPORTS, labels.transports)}
          value={preferences.transport}
          onChange={setTransport}
        />
      </div>

      <Button size="lg" className="h-12 w-full max-w-sm text-base font-bold" onClick={() => onCreate(preferences)}>
        <Sparkles /> {t.trips.aiGenerate}
      </Button>
      <p className="text-sm text-muted-foreground">{t.trips.aiSampleForNow}</p>
    </section>
  );
}
