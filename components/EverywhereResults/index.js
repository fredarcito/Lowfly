"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import BestPrice from "@/components/BestPrice";
import ResultRow, { ResultList } from "@/components/ResultRow";
import FailedNote from "@/components/FailedNote";
import Section from "@/components/Section";
import NoResults from "@/components/NoResults";
import { useI18n } from "@/components/I18nProvider";
import { airlinesOf, normalize } from "@/lib/format";
import { noTimeOff } from "@/lib/weekend";

export default function EverywhereResults({ data }) {
  const { t, f: fmt } = useI18n();
  const { origin, roundTrip, weekend, results, failed } = data;
  const priceNote = roundTrip ? t.results.roundTrip : undefined;
  const [query, setQuery] = useState("");

  if (!results.length) {
    return (
      <NoResults failed={failed}>{t.results.noFlightsEverywhere}</NoResults>
    );
  }

  const [best] = results;
  const q = normalize(query.trim());
  const shown = q ? results.filter((f) => normalize(`${f.city} ${f.country} ${f.code}`).includes(q)) : results;

  return (
    <>
      <BestPrice
        price={best.price}
        cur={best.cur}
        title={`${best.city}, ${best.country}`}
        detail={weekend ? fmt.weekendDates(best) : t.results.airportAdult(best.code)}
        links={fmt.fareLinks(best, origin)}
        fare={best}
        origin={origin}
        priceNote={priceNote}
      />
      <FailedNote failed={failed} />
      <Section
        title={t.results.destinations(results.length)}
        note={roundTrip ? t.results.destNoteReturn : t.results.destNoteOneway}
        action={
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t.results.filter}
              aria-label={t.results.filterAria}
              className="h-10 pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        }
      >
        {shown.length ? (
          <ResultList>
            {shown.map((f) => (
              <ResultRow
                key={f.code}
                rank={results.indexOf(f) + 1}
                href={fmt.fareLinks(f, origin)[0].href}
                title={`${f.city}, ${f.country}`}
                meta={weekend ? fmt.weekendDates(f) : `${fmt.fareDates(f)} · ${f.code}`}
                tag={weekend && noTimeOff(f) && { label: t.results.noTimeOff, hint: t.results.noTimeOffHint }}
                airlines={airlinesOf(f)}
                priceNote={priceNote}
                price={f.price}
                cur={f.cur}
              />
            ))}
          </ResultList>
        ) : (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            {t.results.noMatch(query)}
          </p>
        )}
      </Section>
    </>
  );
}
