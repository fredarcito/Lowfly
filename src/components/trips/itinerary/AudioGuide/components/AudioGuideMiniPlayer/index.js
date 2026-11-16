"use client";

import { LoaderCircle, Pause, Play, X } from "lucide-react";
import { useAudioGuide } from "@/context/audioGuide";
import { useI18n } from "@/context/i18n";

// The guide folded away: a dark bar at the bottom with the part playing, play / pause and close, so the visitor
// can look at the rest of the plan while listening. Tapping it opens the sheet again.
const AudioGuideMiniPlayer = () => {
  const { texts } = useI18n();
  const player = useAudioGuide();
  const words = texts.trips.audioGuide;
  if (player.view !== "mini") return null;

  const ready = player.status === "ready";
  const title = player.guide?.title ?? player.place?.title ?? "";

  return (
    <div className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] z-40 mx-auto max-w-md overflow-hidden rounded-2xl bg-foreground text-background shadow-xl">
      <div className="flex items-center gap-1.5 py-2 pr-2 pl-4">
        <button type="button" onClick={player.expand} aria-label={words.expand} className="grid min-h-11 min-w-0 flex-1 text-left">
          <span className="truncate text-xs opacity-75">
            {ready ? `${title} · ${words.part(player.stepIndex + 1, player.guide.steps.length)}` : title}
          </span>
          <span className="truncate font-semibold">{ready ? player.step.title : words.preparing}</span>
        </button>
        {ready ? (
          <button
            type="button"
            onClick={player.togglePlay}
            aria-label={player.playing ? words.pause : words.play}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-background text-foreground"
          >
            {player.playing ? <Pause className="size-5 fill-current" /> : <Play className="ml-0.5 size-5 fill-current" />}
          </button>
        ) : (
          player.status === "loading" && <LoaderCircle className="mx-3 size-5 animate-spin motion-reduce:animate-none" aria-hidden />
        )}
        <button type="button" onClick={player.close} aria-label={words.close} className="grid size-11 shrink-0 place-items-center opacity-75">
          <X className="size-5" />
        </button>
      </div>
      {ready && (
        <div className="h-0.5 bg-background/20">
          <div className="h-full bg-primary" style={{ width: `${player.progress * 100}%` }} />
        </div>
      )}
    </div>
  );
};

export default AudioGuideMiniPlayer;
