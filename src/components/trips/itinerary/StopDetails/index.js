"use client";

import { Footprints, Lightbulb } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { cn } from "@/utils/cn";
import Block from "@/components/trips/itinerary/StopDetails/components/Block";
import MealDetails from "@/components/trips/itinerary/StopDetails/components/MealDetails";
import StopHistory from "@/components/trips/itinerary/StopDetails/components/StopHistory";

// Colour of each kind of stop label: outlined, so the kind of stop leads and the price and walk beside it stay quiet
const TYPE_STYLES = {
  imprescindible: "border-primary/60 text-primary-ink",
  recomendado: "border-save/60 text-save",
  opcional: "border-foreground/15 text-muted-foreground",
  transporte: "border-sea/60 text-sea",
  logistica: "border-sea/60 text-sea",
  llegada: "border-sea/60 text-sea",
};
const CHIP = "rounded-full border px-2.5 py-0.5 text-xs";

// What a stop holds once opened: why go, what to look for, the plan's practical note, labels, history. A meal has
// its own panel (MealDetails: where to look and what to order, in `town`).
const StopDetails = ({ stop, town }) => {
  const { texts } = useI18n();
  if (stop.type === "comida") return <MealDetails stop={stop} town={town} />;
  const typeLabel = texts.trips.types[stop.type];
  return (
    <div className="grid gap-3">
      {stop.why && <Block title={texts.trips.whyVisit}>{stop.why}</Block>}
      {stop.lookFor && <Block title={texts.trips.lookFor}>{stop.lookFor}</Block>}
      {stop.note && (
        <p className="flex gap-1.5 text-sm text-muted-foreground">
          <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-primary-ink" /> {stop.note}
        </p>
      )}
      {(typeLabel || stop.cost || stop.walkToNext) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {typeLabel && <span className={cn(CHIP, "font-medium", TYPE_STYLES[stop.type])}>{typeLabel}</span>}
          {stop.cost && <span className={cn(CHIP, "border-foreground/15 text-muted-foreground")}>{stop.cost}</span>}
          {stop.walkToNext && (
            <span className={cn(CHIP, "flex items-center gap-1 border-foreground/15 font-medium")} title={texts.trips.walkHint}>
              <Footprints className="size-3.5" /> {texts.trips.walk(stop.walkToNext)}
            </span>
          )}
        </div>
      )}
      <StopHistory history={stop.history} sources={stop.sources} />
    </div>
  );
};

export default StopDetails;
