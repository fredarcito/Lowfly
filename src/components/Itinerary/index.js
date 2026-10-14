"use client";

import { useState } from "react";
import { Car, Footprints, MapPin, Navigation, RefreshCw, Sparkles, TrainFront, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import ItineraryMap from "@/components/ItineraryMap";
import { useI18n } from "@/context/i18n";
import { inTown, placeUrl, routeUrls, sampleItinerary } from "@/utils/itinerary";
import { updateTrip } from "@/store/trips";
import { cn } from "@/utils/cn";

const MODE_ICONS = { walking: Footprints, driving: Car, transit: TrainFront };

// Colour of each kind of stop (dot and label)
const TYPE_STYLES = {
  imprescindible: "bg-primary text-primary-foreground",
  recomendado: "bg-save text-white",
  opcional: "bg-muted-foreground/25 text-foreground",
  comida: "bg-sun text-[oklch(0.23_0.035_245)]",
  transporte: "bg-sea/80 text-white",
  logistica: "bg-sea/80 text-white",
  llegada: "bg-sea/80 text-white",
};

// The trip's day-by-day plan, or the button to create it
export default function Itinerary({ trip }) {
  const { t } = useI18n();
  const [picked, setPicked] = useState(0);
  const itinerary = trip.itinerary;
  // Until the AI is connected, "create" uses a hand-made sample (lib/itinerary)
  const create = () => {
    updateTrip(trip.id, { itinerary: sampleItinerary(trip) });
    setPicked(0);
  };

  if (!itinerary) {
    return (
      <section className="grid justify-items-start gap-3 rounded-xl border border-dashed p-5 sm:p-6">
        <Sparkles className="size-6 text-primary" />
        <h2 className="font-heading text-xl font-bold tracking-tight">{t.trips.itinerary}</h2>
        <p className="max-w-[55ch] text-sm text-muted-foreground">{t.trips.createHint}</p>
        <Button size="lg" className="h-11 px-5 text-base font-bold" onClick={create}>
          <Sparkles /> {t.trips.create}
        </Button>
      </section>
    );
  }

  const day = itinerary.days[Math.min(picked, itinerary.days.length - 1)];
  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">{t.trips.itinerary}</h2>
        <Button variant="ghost" size="sm" onClick={create} className="text-muted-foreground">
          <RefreshCw /> {t.trips.regenerate}
        </Button>
      </div>
      {itinerary.source !== "ai" && (
        <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          {itinerary.source === "sample-other-city" ? t.trips.sampleOtherCity(trip.fare.city) : t.trips.sampleNote}
        </p>
      )}

      <DayTabs days={itinerary.days} picked={picked} onPick={setPicked} />
      <Day day={day} key={day.date} />
    </section>
  );
}

function DayTabs({ days, picked, onPick }) {
  const { t, f } = useI18n();
  return (
    <div role="tablist" aria-label={t.trips.itinerary} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:px-0">
      {days.map((day, index) => (
        <button
          key={day.date}
          role="tab"
          type="button"
          aria-selected={index === picked}
          onClick={() => onPick(index)}
          className={cn(
            "grid shrink-0 rounded-xl border px-4 py-2 text-left transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
            index === picked ? "border-primary/40 bg-selected" : "border-input hover:bg-muted"
          )}
        >
          <span className={cn("text-xs font-semibold tracking-wide uppercase", index === picked ? "text-primary-ink" : "text-muted-foreground")}>
            {t.trips.day(index + 1)}
          </span>
          <span className="text-sm font-medium first-letter:uppercase">{f.fmtShort(day.date)}</span>
        </button>
      ))}
    </div>
  );
}

function Day({ day }) {
  const { t } = useI18n();
  const ModeIcon = MODE_ICONS[day.mode] ?? Footprints;
  const routes = routeUrls(day);
  // Stops with a place are numbered as on the map
  let placeCount = 0;
  const stops = day.stops.map((stop) => ({ ...stop, number: stop.place ? ++placeCount : null }));
  const mapStops = stops
    .filter((stop) => stop.place)
    .map((stop) => ({ number: stop.number, name: stop.place.name, lat: stop.place.lat, lng: stop.place.lng }));

  return (
    <div role="tabpanel" className="grid gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
      <div className="grid gap-1">
        <h3 className="font-heading text-lg leading-snug font-semibold">{day.title}</h3>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <ModeIcon className="size-4" /> {t.trips.modes[day.mode] ?? t.trips.modes.walking} · {t.trips.stops(day.stops.length)}
        </p>
      </div>

      {routes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {routes.map((href, legIndex) => (
            <Button key={href} asChild className="h-10 font-semibold">
              <a href={href} target="_blank" rel="noopener noreferrer">
                <Navigation /> {routes.length > 1 ? t.trips.openRouteLeg(legIndex + 1, routes.length) : t.trips.openRoute}
              </a>
            </Button>
          ))}
        </div>
      )}

      {mapStops.length > 0 && (
        <ItineraryMap stops={mapStops} focus={inTown(mapStops)} className="relative isolate z-0 h-64 overflow-hidden rounded-lg ring-1 ring-foreground/10 sm:h-80" />
      )}

      <ol className="grid">
        {stops.map((stop, index) => (
          <Stop key={index} stop={stop} last={index === stops.length - 1} />
        ))}
      </ol>
    </div>
  );
}

function Stop({ stop, last }) {
  const { t } = useI18n();
  return (
    <li className="grid grid-cols-[3.25rem_1rem_1fr] gap-x-2">
      <span className="pt-0.5 text-right text-xs font-semibold text-muted-foreground tabular-nums">{stop.time}</span>
      {/* Timeline: a dot (with the map number for places) and the line down to the next stop */}
      <span className="relative flex justify-center">
        <span
          className={cn(
            "z-10 mt-0.5 grid size-4 place-items-center rounded-full text-[9px] font-bold",
            stop.number ? "bg-primary text-primary-foreground" : "bg-muted-foreground/40"
          )}
        >
          {stop.number ?? ""}
        </span>
        {!last && <span className="absolute top-5 bottom-0 w-px bg-border" />}
      </span>
      <div className="grid gap-1 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{stop.title}</span>
          {t.trips.types[stop.type] && (
            <span className={cn("rounded-full px-1.5 py-px text-[10px] font-semibold", TYPE_STYLES[stop.type])}>
              {t.trips.types[stop.type]}
            </span>
          )}
          {stop.cost && <span className="text-xs text-muted-foreground">{stop.cost}</span>}
        </div>
        {stop.note && <p className="text-sm text-muted-foreground">{stop.note}</p>}
        {stop.food && (
          <p className="flex gap-1.5 text-sm text-muted-foreground">
            <Utensils className="mt-0.5 size-3.5 shrink-0" /> {stop.food}
          </p>
        )}
        {stop.place && (
          <a
            href={placeUrl(stop.place)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-fit items-center gap-1 text-sm font-semibold text-primary-ink hover:underline"
          >
            <MapPin className="size-3.5" /> {t.trips.openPlace}
          </a>
        )}
      </div>
    </li>
  );
}
