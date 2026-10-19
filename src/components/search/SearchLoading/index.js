"use client";

import { useI18n } from "@/context/i18n";
import { useCycle } from "@/hooks/useCycle";
import FlightScene from "@/components/search/SearchLoading/components/FlightScene";
import { DESTINATION_CODES } from "@/components/search/SearchLoading/data/destinationCodes";

const PHRASE_MS = 2200;
const CODE_MS = 650;

// While searching: a plane flying from the departure airport to a destination still being looked for, what is
// being done (`text`) and playful phrases that change every few seconds
const SearchLoading = ({ text, origin }) => {
  const { texts } = useI18n();
  const phrases = texts.loadingPhrases;
  const phraseIndex = useCycle(phrases.length, PHRASE_MS);
  // Never the departure airport itself
  const codes = DESTINATION_CODES.filter((code) => code !== origin);
  const codeIndex = useCycle(codes.length, CODE_MS);

  return (
    <section role="status" aria-live="polite" className="grid min-h-80 content-center justify-items-center gap-3 rounded-xl bg-card px-5 py-10 text-center ring-1 ring-foreground/10 sm:min-h-96 sm:py-14">
      <FlightScene origin={origin} destination={codes[codeIndex % codes.length]} />
      <div className="grid gap-1">
        <p className="font-heading text-lg font-bold">{text}</p>
        <p key={phraseIndex} className="min-h-5 text-sm text-muted-foreground duration-500 animate-in fade-in slide-in-from-bottom-1 motion-reduce:animate-none">
          {phrases[phraseIndex]}
        </p>
      </div>
    </section>
  );
};

export default SearchLoading;
