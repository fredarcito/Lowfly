"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Luggage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ResultRow, { AltRow, ResultList } from "@/components/ResultRow";
import { useI18n } from "@/components/I18nProvider";
import { airlinesOf } from "@/lib/format";
import { nextWeekends, noTimeOff } from "@/lib/weekend";
import { cn } from "@/lib/utils";

const SHOWN = 5;
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

  useEffect(() => setWeekends(nextWeekends(WEEKENDS)), []);

  const weekend = weekends?.[picked];
  const key = weekend && `${origin} ${lang} ${weekend.from}`;
  const state = (key && cache[key]) ?? { status: "loading" };

  useEffect(() => {
    if (!weekend || !/^[A-Z]{3}$/.test(origin) || cache[key]) return;
    const params = new URLSearchParams({ origin, ...weekend, trip: "return", weekend: "1", lang });
    fetch(`/api/everywhere?${params}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => ({ status: "ok", data }))
      .catch(() => ({ status: "error" }))
      .then((s) => setCache((c) => ({ ...c, [key]: s })));
  }, [origin, lang, weekend, key, cache]);

  if (state.status === "error") return fallback;
  const results = state.data?.results ?? [];

  return (
    <section className="grid gap-4" aria-busy={state.status === "loading"}>
      <div className="grid gap-1">
        <h2 className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight">
          <Luggage className="size-5 text-primary" /> {t.deals.title}
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
              i === picked ? "border-foreground bg-foreground text-background" : "border-input hover:bg-muted"
            )}
          >
            {i === 0 && `${t.deals.thisWeekend} · `}
            {f.fmtRange(w.from, w.to)}
          </button>
        ))}
      </div>

      {state.status === "loading" ? (
        <div className="grid gap-2">
          {Array.from({ length: SHOWN }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">{t.results.noFlights}</p>
      ) : (
        <>
          <ResultList>
            {results.slice(0, SHOWN).map((fare) => (
              <div key={fare.code}>
                <ResultRow
                  href={f.fareLinks(fare, origin)[0].href}
                  title={`${fare.city}, ${fare.country}`}
                  meta={f.weekendDates(fare)}
                  tag={noTimeOff(fare) && { label: t.results.noTimeOff, hint: t.results.noTimeOffHint }}
                  airlines={airlinesOf(fare)}
                  priceNote={t.results.roundTrip}
                  price={fare.price}
                  cur={fare.cur}
                />
                {fare.noTimeOffAlt && (
                  <AltRow
                    href={f.fareLinks(fare.noTimeOffAlt, origin)[0].href}
                    tag={{ label: t.results.noTimeOff, hint: t.results.noTimeOffHint }}
                    meta={f.weekendDates(fare.noTimeOffAlt)}
                    airlines={airlinesOf(fare.noTimeOffAlt)}
                    price={fare.noTimeOffAlt.price}
                    cur={fare.noTimeOffAlt.cur}
                  />
                )}
              </div>
            ))}
          </ResultList>
          {results.length > SHOWN && (
            <Button variant="outline" className="justify-self-start" onClick={() => onSeeAll(weekend)}>
              {t.deals.seeAll} ({results.length}) <ArrowRight />
            </Button>
          )}
        </>
      )}
    </section>
  );
}
