"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import ModeTabs from "@/components/search/ModeTabs";
import SearchError from "@/components/search/SearchError";
import SearchForm from "@/components/search/SearchForm";
import SearchHero from "@/components/search/SearchHero";
import SearchLoading from "@/components/search/SearchLoading";
import SearchStart from "@/components/search/SearchStart";
import SearchSummary from "@/components/search/SearchSummary";
import Collapse from "@/components/shared/Collapse";
import SiteFooter from "@/components/layout/SiteFooter";
import CountryResults from "@/components/search/results/CountryResults";
import EverywhereResults from "@/components/search/results/EverywhereResults";
import FlexibleResults from "@/components/search/results/FlexibleResults";
import MultiCityResults from "@/components/search/results/MultiCityResults";
import MultiCityPromo from "@/components/search/MultiCityPromo";
import { useI18n } from "@/context/i18n";
import { findAirport, useAirports } from "@/hooks/useAirports";
import { useFlightSearch } from "@/components/search/FlightSearch/hooks/useFlightSearch";
import { useSearchForm } from "@/components/search/FlightSearch/hooks/useSearchForm";
import { ENTER_RISE } from "@/constants/motion";
import { ROUTES } from "@/constants/routes";
import { modeOfPath } from "@/constants/searchPages";
import { MAX_FREE_NIGHTS, MIN_FREE_NIGHTS } from "@/constants/multiCity";
import { cn } from "@/utils/cn";
import { nightsBetween } from "@/utils/dates";

const RESULTS = { everywhere: EverywhereResults, country: CountryResults, trip: FlexibleResults, multiCity: MultiCityResults };

// An "A cualquier sitio" search whose dates are enough for a route (5 to 15 days)
const fitsRoute = (query) => {
  if (query?.mode !== "everywhere" || !query.from || !query.to) return false;
  const nights = nightsBetween(query.from, query.to);
  return nights >= MIN_FREE_NIGHTS && nights <= MAX_FREE_NIGHTS;
};

// The search pages (the home and each kind's own page, app/[lang]/(search)): the header, the search card (the form,
// or a one-line summary of the search while showing its results) and below it what there is before searching, the
// progress, an error or the results. The kind of search is the page's (constants/searchPages; the home: anywhere);
// a tab goes to another kind's page, and as every search page shares this (their layout), what was typed stays.
// The form lives in useSearchForm and running a search in useFlightSearch.
const FlightSearch = () => {
  const { lang, texts } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  // The kind of search: the page's, or the tab just picked while its page loads (a search started meanwhile is of
  // the new kind). `page`: the kind whose headline shows (none on the home).
  const pageOf = (path) => ({ pathname: path, page: modeOfPath(path), mode: modeOfPath(path) ?? "everywhere" });
  const [shown, setShown] = useState(() => pageOf(pathname));
  if (shown.pathname !== pathname) setShown(pageOf(pathname));
  const { mode, page: pageMode } = shown;
  const airports = useAirports(lang);
  const flightSearch = useFlightSearch(lang);
  const { result, query, collapsed } = flightSearch;
  const { form, setForm, setField, countries } = useSearchForm({ lang, mode, onShared: flightSearch.search });

  const changeMode = (nextMode) => {
    flightSearch.reset();
    setShown({ pathname, page: nextMode, mode: nextMode });
    router.push(ROUTES.search(lang, nextMode), { scroll: false });
  };

  const onSubmit = (event) => {
    event.preventDefault();
    flightSearch.search(form, mode);
  };

  // "See every destination" from the weekend deals: the anywhere search for that weekend
  const searchWeekend = ({ from, to }) => {
    const weekendForm = { ...form, from, to, trip: "return", weekend: true };
    setForm(weekendForm);
    flightSearch.search(weekendForm, "everywhere");
  };

  // "Ver recorridos con estas fechas" under the "A cualquier sitio" results: the same days in the routes search
  const searchRoutes = () => {
    const routesForm = { ...form, freeFrom: query.from, freeTo: query.to };
    setForm(routesForm);
    flightSearch.search(routesForm, "multiCity");
  };

  const Results = result.status === "done" && result.mode === mode ? RESULTS[mode] : null;

  // At least as tall as the screen, the content stretching: on a short page the footer still sits at the bottom
  return (
    <div className="flex min-h-dvh flex-col">
      <SearchHero collapsed={collapsed} mode={pageMode} />

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
            <ModeTabs mode={mode} onChange={changeMode}>
              <SearchForm
                mode={mode}
                form={form}
                airports={airports}
                countries={countries}
                busy={result.status === "loading"}
                onField={setField}
                onSubmit={onSubmit}
              />
            </ModeTabs>
          </Collapse>
        </Card>
      </div>

      <main
        className="mx-auto grid w-full max-w-[calc(64rem+3rem)] flex-1 auto-rows-max gap-8 px-4 pt-8 pb-10 sm:px-6"
        aria-live="polite"
        aria-busy={result.status === "loading"}
      >
        {result.status === "idle" && (
          <SearchStart mode={mode} origin={form.origin} originName={findAirport(airports, form.origin)?.city} onSeeAll={searchWeekend} />
        )}
        {result.status === "loading" && <SearchLoading text={texts.loading[result.mode]} origin={query?.origin} />}
        {result.status === "error" && <SearchError code={result.code} params={result.params} />}
        {Results && (
          <div className="grid gap-8 duration-500 animate-in fade-in slide-in-from-bottom-4 motion-reduce:animate-none">
            {/* A new search starts its results afresh (a kind of trip picked before does not stay) */}
            <Results key={result.searchId} data={result.data} stopovers={result.stopovers} />
            {fitsRoute(query) && <MultiCityPromo onSearch={searchRoutes} />}
          </div>
        )}
      </main>
      {/* The same foot as every page: the airports, the guides and the legal pages */}
      <SiteFooter />
    </div>
  );
};

export default FlightSearch;
