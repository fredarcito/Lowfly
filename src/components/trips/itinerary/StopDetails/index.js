"use client";

import { Footprints, Lightbulb, Utensils } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { cn } from "@/utils/cn";
import Block from "@/components/trips/itinerary/StopDetails/components/Block";
import StopHistory from "@/components/trips/itinerary/StopDetails/components/StopHistory";

// Colour of each kind of stop label
const TYPE_STYLES = {
  imprescindible: "bg-primary/15 text-primary-ink",
  recomendado: "bg-save/15 text-save",
  opcional: "bg-muted text-muted-foreground",
  comida: "bg-sun/25 text-foreground",
  transporte: "bg-sea/15 text-sea",
  logistica: "bg-sea/15 text-sea",
  llegada: "bg-sea/15 text-sea",
};

// What a stop holds once opened: why go, what to look for, the plan's practical note, food, labels, history
const StopDetails = ({ stop }) => {
  const { texts } = useI18n();
  const typeLabel = texts.trips.types[stop.type];
  return (
    <div className="grid gap-3">
      {stop.why && <Block title={texts.trips.whyVisit}>{stop.why}</Block>}
      {stop.lookFor && <Block title={texts.trips.lookFor}>{stop.lookFor}</Block>}
      {stop.note && (
        <p className="flex gap-1.5 text-sm text-muted-foreground">
          <Lightbulb className="mt-0.5 size-3.5 shrink-0" /> {stop.note}
        </p>
      )}
      {stop.food && (
        <p className="flex gap-1.5 text-sm text-muted-foreground">
          <Utensils className="mt-0.5 size-3.5 shrink-0" /> {stop.food}
        </p>
      )}
      {(typeLabel || stop.cost || stop.walkToNext) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {typeLabel && <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", TYPE_STYLES[stop.type])}>{typeLabel}</span>}
          {stop.cost && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{stop.cost}</span>}
          {stop.walkToNext && (
            <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium" title={texts.trips.walkHint}>
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
