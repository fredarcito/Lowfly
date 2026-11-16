"use client";

import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useAudioGuide } from "@/context/audioGuide";
import { useI18n } from "@/context/i18n";
import { formatClock } from "@/components/trips/itinerary/AudioGuide/utils/clock";

const SIDE_BUTTON =
  "grid size-12 place-items-center rounded-full border border-border bg-background outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-35";

// How far into the step, and the step before, play / pause, the step after. Play is dark, not coral: the coral
// is kept for the button to go on once the step is over.
const GuideControls = () => {
  const { texts } = useI18n();
  const player = useAudioGuide();
  const words = texts.trips.audioGuide;
  const steps = player.guide.steps;

  return (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-foreground transition-[width] duration-200" style={{ width: `${player.progress * 100}%` }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>{formatClock(player.current)}</span>
          <span>{formatClock(player.duration)}</span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-7">
        <button
          type="button"
          onClick={() => player.goTo(player.stepIndex - 1)}
          disabled={player.stepIndex === 0}
          aria-label={words.previous}
          className={SIDE_BUTTON}
        >
          <SkipBack className="size-5" />
        </button>
        <button
          type="button"
          onClick={player.togglePlay}
          aria-label={player.playing ? words.pause : words.play}
          className="grid size-16 place-items-center rounded-full bg-foreground text-background outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {player.playing ? <Pause className="size-7 fill-current" /> : <Play className="ml-1 size-7 fill-current" />}
        </button>
        <button
          type="button"
          onClick={() => player.goTo(player.stepIndex + 1)}
          disabled={player.stepIndex === steps.length - 1}
          aria-label={words.next}
          className={SIDE_BUTTON}
        >
          <SkipForward className="size-5" />
        </button>
      </div>
    </div>
  );
};

export default GuideControls;
