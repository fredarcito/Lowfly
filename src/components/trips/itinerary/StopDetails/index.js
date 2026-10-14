"use client";

import { BookOpen, ChevronDown, Footprints, Lightbulb, Utensils } from "lucide-react";
import Collapse from "@/components/shared/Collapse";
import { useI18n } from "@/context/i18n";
import { useDisclosure } from "@/hooks/useDisclosure";
import { cn } from "@/utils/cn";

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

function Block({ title, children }) {
  return (
    <div className="grid gap-0.5">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</p>
      <p className="text-sm">{children}</p>
    </div>
  );
}

// History and curiosities, folded; only with sources (the AI must back what it says)
function StopHistory({ history, sources }) {
  const { t } = useI18n();
  const section = useDisclosure();
  if (!history || !sources?.length) return null;
  return (
    <div className="rounded-lg ring-1 ring-foreground/10">
      <button
        type="button"
        onClick={section.toggle}
        aria-expanded={section.open}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium"
      >
        <BookOpen className="size-4 text-muted-foreground" />
        <span className="flex-1">{t.trips.history}</span>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", section.open && "rotate-180")} />
      </button>
      <Collapse open={section.open}>
        <div className="grid gap-2 px-3 pb-3 text-sm">
          <p>{history}</p>
          <p className="text-xs text-muted-foreground">
            {t.trips.sources}:{" "}
            {sources.map((source, index) => (
              <span key={source.url}>
                {index > 0 && " · "}
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                  {source.title}
                </a>
              </span>
            ))}
          </p>
        </div>
      </Collapse>
    </div>
  );
}

// What a stop holds once opened: why go, what to look for, the plan's practical note, food, labels, history
export default function StopDetails({ stop }) {
  const { t } = useI18n();
  const typeLabel = t.trips.types[stop.type];
  return (
    <div className="grid gap-3">
      {stop.why && <Block title={t.trips.whyVisit}>{stop.why}</Block>}
      {stop.lookFor && <Block title={t.trips.lookFor}>{stop.lookFor}</Block>}
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
            <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium" title={t.trips.walkHint}>
              <Footprints className="size-3.5" /> {t.trips.walk(stop.walkToNext)}
            </span>
          )}
        </div>
      )}
      <StopHistory history={stop.history} sources={stop.sources} />
    </div>
  );
}
