"use client";

import { Check } from "lucide-react";
import { useAudioGuide } from "@/context/audioGuide";
import { useI18n } from "@/context/i18n";
import { cn } from "@/utils/cn";
import { formatClock } from "@/components/trips/itinerary/AudioGuide/utils/clock";

// Every part of the guide: the ones heard ticked, the one playing in soft coral; any of them plays when tapped
const GuideSteps = () => {
  const { texts } = useI18n();
  const player = useAudioGuide();
  const words = texts.trips.audioGuide;

  return (
    <div className="grid gap-1 border-t border-border pt-3">
      <h3 className="pb-1 text-sm text-muted-foreground">{words.parts}</h3>
      <ol className="grid gap-1">
        {player.guide.steps.map((step, index) => {
          const isCurrent = index === player.stepIndex;
          const isDone = index < player.stepIndex || (isCurrent && player.ended);
          return (
            <li key={index}>
              <button
                type="button"
                onClick={() => player.goTo(index)}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex min-h-13 w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isCurrent && "bg-selected"
                )}
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full text-sm font-semibold",
                    isDone ? "bg-foreground text-background" : "border border-border"
                  )}
                >
                  {isDone ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
                </span>
                <span className="grid min-w-0 flex-1">
                  <span className={cn("truncate", isCurrent && "font-semibold")}>{step.title}</span>
                  <span className="truncate text-xs text-muted-foreground">{step.where}</span>
                </span>
                <span className="text-sm text-muted-foreground tabular-nums">{formatClock(step.seconds)}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default GuideSteps;
