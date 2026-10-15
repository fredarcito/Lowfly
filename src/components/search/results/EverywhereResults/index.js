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

const EverywhereResults = ({ data }) => {
  const { texts, format } = useI18n();
  const { origin, roundTrip, weekend, results, failed } = data;
  const priceNote = roundTrip ? texts.results.roundTrip : undefined;
  const [query, setQuery] = useState("");

  if (!results.length) {
    return (
      <NoResults failed={failed}>{texts.results.noFlightsEverywhere}</NoResults>
    );
  }

  const [best] = results;
  const searched = normalize(query.trim());
  const shown = searched ? results.filter((fare) => normalize(`${fare.city} ${fare.country} ${fare.code}`).includes(searched)) : results;

  return (
    <>
      <BestPrice
        price={best.price}
        cur={best.cur}
        title={`${best.city}, ${best.country}`}
        detail={weekend ? format.weekendDates(best) : texts.results.airportAdult(best.code)}
        links={format.fareLinks(best, origin)}
        fare={best}
        origin={origin}
        priceNote={priceNote}
      />
      <FailedNote failed={failed} />
      <Section
        title={texts.results.destinations(results.length)}
        note={roundTrip ? texts.results.destNoteReturn : texts.results.destNoteOneway}
        action={
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={texts.results.filter}
              aria-label={texts.results.filterAria}
              className="h-10 pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        }
      >
        {shown.length ? (
          <DestinationTable fares={shown} origin={origin} roundTrip={roundTrip} weekend={weekend} />
        ) : (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            {texts.results.noMatch(query)}
          </p>
        )}
      </Section>
    </>
  );
};

export default EverywhereResults;
