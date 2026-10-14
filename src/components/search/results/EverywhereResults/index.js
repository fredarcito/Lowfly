"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import BestPrice from "@/components/search/results/BestPrice";
import DestinationTable from "@/components/search/results/DestinationTable";
import FailedNote from "@/components/search/results/FailedNote";
import Section from "@/components/search/results/Section";
import NoResults from "@/components/search/results/NoResults";
import { useI18n } from "@/context/i18n";
import { normalize } from "@/utils/format";

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
          <DestinationTable fares={shown} origin={origin} roundTrip={roundTrip} weekend={weekend} />
        ) : (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            {t.results.noMatch(query)}
          </p>
        )}
      </Section>
    </>
  );
}
