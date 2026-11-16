"use client";

import { ChevronDown, MapPin } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import GuideControls from "@/components/trips/itinerary/AudioGuide/components/AudioGuideSheet/components/GuideControls";
import GuideError from "@/components/trips/itinerary/AudioGuide/components/AudioGuideSheet/components/GuideError";
import GuideLoading from "@/components/trips/itinerary/AudioGuide/components/AudioGuideSheet/components/GuideLoading";
import GuideNextAction from "@/components/trips/itinerary/AudioGuide/components/AudioGuideSheet/components/GuideNextAction";
import GuideSteps from "@/components/trips/itinerary/AudioGuide/components/AudioGuideSheet/components/GuideSteps";
import GuideTranscript from "@/components/trips/itinerary/AudioGuide/components/AudioGuideSheet/components/GuideTranscript";
import { useAudioGuide } from "@/context/audioGuide";
import { useI18n } from "@/context/i18n";

// The player: which part of the place you are hearing and where to stand, the controls, the button for the next
// spot, the text, and every part of the guide. While the guide is made: a loader; if it failed: why.
const AudioGuideSheet = () => {
  const { texts } = useI18n();
  const player = useAudioGuide();
  const words = texts.trips.audioGuide;
  const { guide, step, status, place } = player;

  return (
    <Sheet open={player.view === "open"} onOpenChange={(open) => !open && player.collapse()}>
      <SheetContent className="mx-auto w-full max-w-lg gap-4 px-5 pt-2" aria-describedby={undefined}>
        <div className="flex items-center justify-between gap-3">
          <div className="grid min-w-0">
            <span className="truncate text-sm text-muted-foreground">{words.title(guide?.title ?? place?.title ?? "")}</span>
            {status === "ready" && (
              <span className="text-sm font-semibold text-primary-ink">{words.part(player.stepIndex + 1, guide.steps.length)}</span>
            )}
          </div>
          <button
            type="button"
            onClick={player.collapse}
            aria-label={words.minimize}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ChevronDown className="size-5" />
          </button>
        </div>

        {status === "loading" && <GuideLoading />}
        {status === "error" && <GuideError />}

        {status === "ready" && step && (
          <>
            {player.showHint && (
              <div className="grid gap-1.5 rounded-xl bg-muted px-4 py-3">
                <p className="text-sm leading-relaxed">{words.hint}</p>
                <button type="button" onClick={player.dismissHint} className="justify-self-start py-1 text-sm font-semibold underline">
                  {words.gotIt}
                </button>
              </div>
            )}
            <div className="grid gap-1">
              <SheetTitle className="font-heading text-2xl leading-tight font-semibold">{step.title}</SheetTitle>
              <SheetDescription className="flex items-center gap-1.5 text-sm">
                <MapPin className="size-4 shrink-0" /> {step.where}
              </SheetDescription>
            </div>
            <GuideControls />
            <GuideNextAction />
            <GuideTranscript key={`${guide.id}-${player.stepIndex}`} text={step.text} />
            <GuideSteps />
            <p className="text-xs text-muted-foreground">
              {words.madeFrom}{" "}
              <a href={guide.source} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                Wikipedia
              </a>
              .
            </p>
          </>
        )}

        {status !== "ready" && <SheetTitle className="sr-only">{words.label}</SheetTitle>}
      </SheetContent>
    </Sheet>
  );
};

export default AudioGuideSheet;
