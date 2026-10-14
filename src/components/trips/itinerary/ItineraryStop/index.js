"use client";

import { Footprints, MapPin, Utensils } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { placeUrl } from "@/utils/itinerary";
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

// One stop of the day. Places carry the map number; picking one highlights it on the map,
// and its pin button opens the place in Google Maps. The dashed line joins it to the next stop.
export default function ItineraryStop({ stop, last, active, onPick }) {
  const { t } = useI18n();
  const pickable = Boolean(stop.number);
  return (
    <li
      onMouseEnter={pickable ? () => onPick(stop.number) : undefined}
      className={cn("relative grid grid-cols-[2.25rem_minmax(0,1fr)_auto] gap-x-3 px-4 py-4 transition-colors sm:px-5", active && "bg-selected")}
    >
      {/* Timeline: the number (or a dot) and the dashed line down to the next stop */}
      <span className="relative flex justify-center">
        {stop.number ? (
          <span
            className={cn(
              "z-10 grid size-9 place-items-center rounded-full bg-primary font-heading text-sm font-bold text-primary-foreground transition-shadow",
              active && "ring-4 ring-primary/30"
            )}
          >
            {stop.number}
          </span>
        ) : (
          <span className="z-10 mt-1.5 size-3 rounded-full bg-muted-foreground/40" />
        )}
        {!last && <span className="absolute top-10 -bottom-4 border-l-2 border-dashed border-border" />}
      </span>

      <div className="grid gap-1">
        {stop.time && <p className="text-sm font-semibold text-muted-foreground tabular-nums">{stop.time}</p>}
        <p>
          {pickable ? (
            <button
              type="button"
              onClick={() => onPick(stop.number)}
              className="text-left font-heading font-semibold outline-none after:absolute after:inset-0 focus-visible:after:ring-3 focus-visible:after:ring-ring/50 focus-visible:after:ring-inset"
            >
              {stop.title}
            </button>
          ) : (
            <span className="font-heading font-semibold">{stop.title}</span>
          )}
        </p>
        {stop.note && <p className="text-sm text-muted-foreground">{stop.note}</p>}
        {stop.food && (
          <p className="flex gap-1.5 text-sm text-muted-foreground">
            <Utensils className="mt-0.5 size-3.5 shrink-0" /> {stop.food}
          </p>
        )}
        {(t.trips.types[stop.type] || stop.cost || stop.walkToNext) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {t.trips.types[stop.type] && (
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", TYPE_STYLES[stop.type])}>{t.trips.types[stop.type]}</span>
            )}
            {stop.cost && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{stop.cost}</span>}
            {stop.walkToNext && (
              <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium" title={t.trips.walkHint}>
                <Footprints className="size-3.5" /> {t.trips.walk(stop.walkToNext)}
              </span>
            )}
          </div>
        )}
      </div>

      {stop.place && (
        <a
          href={placeUrl(stop.place)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${t.trips.openPlace}: ${stop.place.name}`}
          title={t.trips.openPlace}
          className="relative z-10 grid size-9 place-items-center self-start rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <MapPin className="size-4.5" />
        </a>
      )}
    </li>
  );
}
