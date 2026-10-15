"use client";

import OrbitingIcons from "@/components/trips/itinerary/OrbitingIcons";
import Wizard from "@/components/trips/itinerary/Wizard";
import { useI18n } from "@/context/i18n";
import { useCycle } from "@/hooks/useCycle";
import { useElapsedSeconds } from "@/hooks/useElapsedSeconds";

const PHRASE_MS = 2600;

// Elapsed seconds as m:ss (1:05)
const minutesAndSeconds = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

// While the AI creates the itinerary: the wizard, travel icons orbiting around him, playful travel phrases
// that change every few seconds, and how long it usually takes with the time so far (so nobody gives up)
const ItineraryLoader = () => {
  const { texts } = useI18n();
  const phrases = texts.trips.loaderPhrases;
  const phraseIndex = useCycle(phrases.length, PHRASE_MS);
  const elapsedSeconds = useElapsedSeconds();

  return (
    <section
      role="status"
      aria-live="polite"
      className="grid justify-items-center gap-4 rounded-xl bg-card px-5 py-8 text-center ring-1 ring-foreground/10 sm:py-10"
    >
      <div className="relative grid size-64 place-items-center">
        <OrbitingIcons />
        <Wizard />
      </div>

      <div className="grid gap-1">
        <p className="font-heading text-lg font-bold">{texts.trips.loaderTitle}</p>
        <p key={phraseIndex} className="min-h-6 text-muted-foreground duration-500 animate-in fade-in slide-in-from-bottom-1 motion-reduce:animate-none">
          {phrases[phraseIndex]}
        </p>
      </div>

      {/* A quiet footnote, so the phrases above keep the spotlight. The time is not announced every second
          to screen readers: the section is already a live region */}
      <div className="grid gap-0.5 text-xs text-muted-foreground/70">
        <p>
          {texts.trips.loaderWait}
          <span aria-hidden className="tabular-nums"> · {texts.trips.loaderElapsed(minutesAndSeconds(elapsedSeconds))}</span>
        </p>
        <p>{texts.trips.loaderKeepOpen}</p>
      </div>
    </section>
  );
};

export default ItineraryLoader;
