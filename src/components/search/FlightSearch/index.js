"use client";

import { Card } from "@/components/ui/card";
import ModeTabs from "@/components/search/ModeTabs";
import SearchError from "@/components/search/SearchError";
import SearchForm from "@/components/search/SearchForm";
import SearchHero from "@/components/search/SearchHero";
import SearchLoading from "@/components/search/SearchLoading";
import SearchStart from "@/components/search/SearchStart";
import SearchSummary from "@/components/search/SearchSummary";
import Collapse from "@/components/shared/Collapse";
import CountryResults from "@/components/search/results/CountryResults";
import EverywhereResults from "@/components/search/results/EverywhereResults";
import FlexibleResults from "@/components/search/results/FlexibleResults";
import { useI18n } from "@/context/i18n";
import { findAirport, useAirports } from "@/hooks/useAirports";
import { useFlightSearch } from "@/components/search/FlightSearch/hooks/useFlightSearch";
import { useSearchForm } from "@/components/search/FlightSearch/hooks/useSearchForm";
import { ENTER_RISE } from "@/constants/motion";
import { cn } from "@/utils/cn";

const RESULTS = { everywhere: EverywhereResults, country: CountryResults, trip: FlexibleResults };

// The home page: the header, the search card (the form, or a one-line summary of the search while showing
// its results) and below it what there is before searching, the progress, an error or the results.
// The form lives in useSearchForm and running a search in useFlightSearch.
const FlightSearch = () => {
  const { lang, texts } = useI18n();
  const airports = useAirports(lang);
  const flightSearch = useFlightSearch(lang);
  const { result, query, collapsed } = flightSearch;
  const { mode, setMode, form, setForm, setField, countries } = useSearchForm({ lang, onShared: flightSearch.search });

  const changeMode = (nextMode) => {
    setMode(nextMode);
    flightSearch.reset();
  };

  const onSubmit = (event) => {
    event.preventDefault();
    flightSearch.search(form, mode);
  };

  // "See every destination" from the weekend deals: the anywhere search for that weekend
  const searchWeekend = ({ from, to }) => {
    const weekendForm = { ...form, from, to, trip: "return", weekend: true };
    setForm(weekendForm);
    setMode("everywhere");
    flightSearch.search(weekendForm, "everywhere");
  };

  const Results = result.status === "done" && result.mode === mode ? RESULTS[mode] : null;

  return (
    <>
      <SearchHero collapsed={collapsed} />

      {/* The only thing that moves on arriving: the form rises in, as the trip planner's does (the headline is
          already there) */}
      <div className={cn("relative z-10 -mt-20 px-4 sm:px-6", ENTER_RISE)}>
        <Card
          className={cn(
            "mx-auto max-w-5xl gap-0 px-4 shadow-xl transition-[padding] duration-300 motion-reduce:transition-none sm:px-6",
            collapsed ? "py-3 sm:py-4" : "py-4 sm:py-6"
          )}
        >
          <Collapse open={collapsed}>
            <SearchSummary query={query} originName={findAirport(airports, query?.origin)?.city} onEdit={flightSearch.expand} />
          </Collapse>
          <Collapse open={!collapsed}>
            <div className="grid gap-5">
              <ModeTabs mode={mode} onChange={changeMode} />
              <SearchForm
                mode={mode}
                form={form}
                airports={airports}
                countries={countries}
                busy={result.status === "loading"}
                onField={setField}
                onSubmit={onSubmit}
              />
            </div>
          </Collapse>
        </Card>
      </div>

      <main
        className="mx-auto grid max-w-[calc(64rem+3rem)] gap-8 px-4 pt-8 pb-10 sm:px-6"
        aria-live="polite"
        aria-busy={result.status === "loading"}
      >
        {result.status === "idle" && (
          <SearchStart mode={mode} origin={form.origin} originName={findAirport(airports, form.origin)?.city} onSeeAll={searchWeekend} />
        )}
        {result.status === "loading" && <SearchLoading text={texts.loading[result.mode]} />}
        {result.status === "error" && <SearchError code={result.code} params={result.params} />}
        {Results && (
          <div className="grid gap-8 duration-500 animate-in fade-in slide-in-from-bottom-4 motion-reduce:animate-none">
            <Results data={result.data} />
          </div>
        )}
      </main>
    </>
  );
};

export default FlightSearch;
