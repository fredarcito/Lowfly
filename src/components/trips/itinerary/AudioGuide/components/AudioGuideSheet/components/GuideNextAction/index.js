"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioGuide } from "@/context/audioGuide";
import { useI18n } from "@/context/i18n";
import { cn } from "@/utils/cn";

// The step's own button, in the visitor's words ("Ya estoy dentro"): quiet while the step plays, coral once it is
// over. When the next step is heard from the same spot it starts by itself, and the visitor may hold it.
const GuideNextAction = () => {
  const { texts } = useI18n();
  const player = useAudioGuide();
  const words = texts.trips.audioGuide;
  const isLast = player.stepIndex === player.guide.steps.length - 1;

  if (player.waitingNext) {
    return (
      <div className="flex min-h-14 items-center gap-3 rounded-xl bg-muted py-2 pr-2 pl-4">
        <p className="flex-1 text-sm leading-snug">{words.nextSoon}</p>
        <Button variant="outline" onClick={player.cancelWaiting} className="h-11 bg-background">
          {words.wait}
        </Button>
      </div>
    );
  }

  const label = isLast ? words.finish : (player.step.action ?? words.continue);
  return (
    <Button
      variant={player.ended ? "default" : "outline"}
      onClick={player.advance}
      className={cn("h-14 text-base font-semibold", !player.ended && "bg-background")}
    >
      {label} <ArrowRight className="size-5" />
    </Button>
  );
};

export default GuideNextAction;
