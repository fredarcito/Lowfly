"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Copyright, CornerDownRight, Luggage, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AirlineBadge from "@/components/AirlineBadge";
import SaveTripButton from "@/components/SaveTripButton";
import { useI18n } from "@/components/I18nProvider";
import { airlinesOf } from "@/lib/format";
import { nextWeekends, noTimeOff } from "@/lib/weekend";
import { searchFlights } from "@/lib/services/flights";
import { getPhotos } from "@/lib/services/photos";
import { cn } from "@/lib/utils";

const SHOWN = 6; // 3 × 2 on desktop, 2 × 3 on tablets, a swipeable row on phones
const WEEKENDS = 4;

// Before searching: the cheapest weekend trips from the departure airport, for each of the next weekends.
// Each weekend loads when picked and is kept, so going back to one is instant.
// If the airlines fail it shows `fallback` instead.
export default function WeekendDeals({ origin, originName, onSeeAll, fallback }) {
  const { lang, t, f } = useI18n();
  // Dates on the client only: "today" and its time zone are the visitor's, not the server's
  const [weekends, setWeekends] = useState(null);
  const [picked, setPicked] = useState(0);
  const [cache, setCache] = useState({}); // "MLA es 2026-10-16" → { status, data }
  const [photos, setPhotos] = useState({}); // "CTA" → photo, or null without one

  useEffect(() => setWeekends(nextWeekends(WEEKENDS)), []);

  const weekend = weekends?.[picked];
  const key = weekend && `${origin} ${lang} ${weekend.from}`;
  const state = (key && cache[key]) ?? { status: "loading" };
  const results = state.data?.results ?? [];
  const shown = results.slice(0, SHOWN);

  useEffect(() => {
    if (!weekend || !/^[A-Z]{3}$/.test(origin) || cache[key]) return;
    searchFlights("everywhere", { origin, ...weekend, trip: "return", weekend: "1", lang })
      .then((data) => ({ status: "ok", data }))
      .catch(() => ({ status: "error" }))
      .then((loaded) => setCache((current) => ({ ...current, [key]: loaded })));
  }, [origin, lang, weekend, key, cache]);

  // Photos of the destinations on screen that we have not asked for yet
  const missingKey = shown
    .map((r) => r.code)
    .filter((c) => !(c in photos))
    .join(",");
  useEffect(() => {
    if (!missingKey) return;
    const codes = missingKey.split(",");
    getPhotos(codes)
      .catch(() => ({}))
      .then((found) => setPhotos((current) => ({ ...current, ...Object.fromEntries(codes.map((code) => [code, found[code] ?? null])) })));
  }, [missingKey]);

  if (state.status === "error") return fallback;

  return (
    <section className="grid gap-4" aria-busy={state.status === "loading"}>
      <div className="grid gap-1">
        <h2 className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight sm:text-2xl">
          <Luggage className="size-5 text-primary sm:size-6" /> {t.deals.title}
        </h2>
        <p className="text-sm text-muted-foreground">{t.deals.subtitle(originName ?? origin)}</p>
      </div>

      <div
        role="group"
        aria-label={t.deals.weekends}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {weekends?.map((w, i) => (
          <button
            key={w.from}
            type="button"
            aria-pressed={i === picked}
            onClick={() => setPicked(i)}
            className={cn(
              "h-9 shrink-0 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              i === picked ? "border-primary/40 bg-selected text-primary-ink [-webkit-text-stroke:0.4px_currentColor]" : "border-input hover:bg-muted"
            )}
          >
            {i === 0 && `${t.deals.thisWeekend} · `}
            {f.fmtRange(w.from, w.to)}
          </button>
        ))}
      </div>

      {state.status !== "loading" && results.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">{t.results.noFlights}</p>
      ) : (
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
          {state.status === "loading"
            ? Array.from({ length: SHOWN }, (_, i) => (
                <Skeleton key={i} className="aspect-[4/3.4] w-[82%] shrink-0 snap-start rounded-xl sm:w-auto" />
              ))
            : shown.map((fare) => <DealCard key={fare.code} fare={fare} origin={origin} photo={photos[fare.code]} />)}
        </div>
      )}

      {results.length > SHOWN && (
        <Button variant="outline" className="justify-self-start" onClick={() => onSeeAll(weekend)}>
          {t.deals.seeAll} ({results.length}) <ArrowRight />
        </Button>
      )}
    </section>
  );
}

// A destination with its photo. The whole card opens the booking; the no-time-off alternative and
// the photo credit are links of their own on top of it.
function DealCard({ fare, origin, photo }) {
  const { t, f } = useI18n();
  const alt = fare.noTimeOffAlt;
  return (
    <article className="group relative flex w-[82%] shrink-0 snap-start flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-lg hover:ring-foreground/20 sm:w-auto">
      <div className="relative aspect-16/10 overflow-hidden bg-[linear-gradient(135deg,var(--sea),color-mix(in_oklab,var(--primary)_70%,var(--sea)))]">
        {photo ? (
          <img
            src={photo.src}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
          />
        ) : (
          photo === null && <Plane className="absolute inset-0 m-auto size-10 -rotate-45 text-white/30" />
        )}
        {photo && (
          <a
            href={photo.page}
            target="_blank"
            rel="noopener noreferrer"
            title={t.deals.photoBy(photo.author, photo.license)}
            aria-label={t.deals.photoBy(photo.author, photo.license)}
            className="absolute right-2 bottom-2 z-10 grid size-6 place-items-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm hover:bg-black/60 hover:text-white"
          >
            <Copyright className="size-3.5" />
          </a>
        )}
        <SaveTripButton origin={origin} fare={fare} compact className="absolute top-2 right-2 z-10" />
        {noTimeOff(fare) && (
          <span
            title={t.results.noTimeOffHint}
            className="absolute top-2 left-2 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm"
          >
            {t.results.noTimeOff}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 font-heading text-lg leading-tight font-semibold">
            {/* Stretched link: the whole card */}
            <a
              href={f.fareLinks(fare, origin)[0].href}
              target="_blank"
              rel="noopener noreferrer"
              className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
            >
              {fare.city}, <span className="font-normal text-muted-foreground">{fare.country}</span>
            </a>
          </h3>
          <span className="grid shrink-0 justify-items-end">
            <span className="font-heading text-xl font-extrabold tabular-nums">{f.money(fare.price, fare.cur)}</span>
            <span className="text-xs text-muted-foreground">{t.results.roundTrip}</span>
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{f.weekendDates(fare)}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="flex gap-1.5">
            {airlinesOf(fare).map((a) => (
              <AirlineBadge key={a} airline={a} />
            ))}
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold text-primary-ink">
            {t.deals.viewFlights}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
        {alt && (
          <a
            href={f.fareLinks(alt, origin)[0].href}
            target="_blank"
            rel="noopener noreferrer"
            title={`${t.results.noTimeOffHint} · ${f.weekendDates(alt)}`}
            className="relative z-10 -mx-4 -mb-4 flex items-center gap-2 border-t bg-save/10 px-4 py-2 text-xs font-medium text-save hover:bg-save/20"
          >
            <CornerDownRight className="size-3.5" />
            {t.deals.noTimeOffFrom(f.money(alt.price, alt.cur))}
            <ArrowRight className="ml-auto size-3.5" />
          </a>
        )}
      </div>
    </article>
  );
}
