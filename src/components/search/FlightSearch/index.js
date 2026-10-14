"use client";

import { useEffect, useState } from "react";
import { CircleAlert, Copyright, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ModeTabs, { MODES } from "@/components/search/ModeTabs";
import SearchForm from "@/components/search/SearchForm";
import SearchSummary from "@/components/search/SearchSummary";
import Collapse from "@/components/shared/Collapse";
import EverywhereResults from "@/components/search/results/EverywhereResults";
import CountryResults from "@/components/search/results/CountryResults";
import FlexibleResults from "@/components/search/results/FlexibleResults";
import WeekendDeals from "@/components/search/WeekendDeals";
import TopBar from "@/components/layout/TopBar";
import TripsPromo from "@/components/search/TripsPromo";
import { useI18n } from "@/context/i18n";
import { errorMessage } from "@/i18n";
import { nextFriday, shift, tomorrow } from "@/utils/dates";
import { searchFromParams, searchToParams } from "@/utils/share";
import { DEFAULT_ORIGIN } from "@/constants/airports";
import { savedOrigin, saveOrigin } from "@/store/origin";
import { apiError, isCancelled } from "@/api/client";
import { getDefaultOrigin } from "@/api/airports";
import { findAirport, useAirports } from "@/hooks/useAirports";
import { getDestinations, searchFlights } from "@/api/flights";
import { cn } from "@/utils/cn";

const RESULTS = { everywhere: EverywhereResults, country: CountryResults, trip: FlexibleResults };
// No results: the form opens again so the search can be changed
const EMPTY = { everywhere: (d) => !d.results.length, country: (d) => !d.best, trip: (d) => !d.top };

// Destinations grouped by country, then by city (every airport of a city together), sorted by name:
// [{ name, countryCode, codes, cities: [{ name, codes }] }]
function countriesOf(destinations, lang) {
  const byCountry = new Map();
  for (const destination of destinations) {
    if (!byCountry.has(destination.country))
      byCountry.set(destination.country, { name: destination.country, countryCode: destination.countryCode, codes: [], cities: new Map() });
    const country = byCountry.get(destination.country);
    country.codes.push(destination.code);
    if (!country.cities.has(destination.city)) country.cities.set(destination.city, { name: destination.city, codes: [] });
    country.cities.get(destination.city).codes.push(destination.code);
  }
  const byName = (first, second) => first.name.localeCompare(second.name, lang);
  return [...byCountry.values()]
    .map((country) => ({ ...country, cities: [...country.cities.values()].sort(byName) }))
    .sort(byName);
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function FlightSearch() {
  const { lang, t } = useI18n();
  const [mode, setMode] = useState("everywhere");
  const [form, setForm] = useState({ origin: "", country: "", city: "", from: "", to: "", ida: "", vuelta: "", flex: "2", max: "", trip: "oneway", minN: "2", maxN: "4", weekend: false });
  const [countries, setCountries] = useState({ status: "loading", list: [] });
  const [result, setResult] = useState({ status: "idle" });
  // While searching and with results, the form folds into a one-line summary of `query`
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState(null);

  // Default dates on the client (avoids hydration mismatches)
  useEffect(() => {
    const t = tomorrow();
    const fri = nextFriday();
    const defaults = { ...form, origin: savedOrigin(), from: t, to: shift(t, 60), ida: fri, vuelta: shift(fri, 3) };

    // A shared link (?m=…&o=…): its search, run straight away unless its dates have passed
    const shared = searchFromParams(new URLSearchParams(window.location.search));
    if (shared) {
      const next = { ...defaults, ...shared.fields };
      setForm(next);
      setMode(shared.mode);
      if (!shared.stale) search(next, shared.mode);
      return;
    }
    setForm(defaults);

    // First visit: the main airport of the visitor's country, or Malta
    if (savedOrigin()) return;
    getDefaultOrigin(Intl.DateTimeFormat().resolvedOptions().timeZone)
      .catch(() => DEFAULT_ORIGIN)
      .then((origin) => setForm((current) => (current.origin ? current : { ...current, origin })));
  }, []);

  // Every departure airport, with names in the page language (shared with the result cards)
  const airports = useAirports(lang);

  // Destinations (countries and their cities), refreshed whenever the departure airport changes
  useEffect(() => {
    if (!/^[A-Z]{3}$/.test(form.origin)) return;
    const request = new AbortController();
    setCountries({ status: "loading", list: [] });

    getDestinations(form.origin, lang, { signal: request.signal })
      .then((destinations) => {
        const list = countriesOf(destinations, lang);
        setCountries({ status: list.length ? "ok" : "error", list });
        // Keeps the destination if this airport also flies there (the city too, or else the whole country)
        setForm((current) => {
          const country = list.find((candidate) => candidate.name === current.country);
          if (!country) return { ...current, country: list[0]?.name || "", city: "" };
          return { ...current, city: country.cities.some((city) => city.name === current.city) ? current.city : "" };
        });
      })
      .catch((error) => !isCancelled(error) && setCountries({ status: "error", list: [] }));

    return () => request.abort();
  }, [form.origin, lang]);

  const onField = (name, value) => {
    if (name === "origin") saveOrigin(value);
    setForm((f) => ({ ...f, [name]: value }));
  };

  const changeMode = (m) => {
    setMode(m);
    setResult({ status: "idle" });
  };

  // `code` is a key of t.errors (lib/i18n)
  const fail = (code, params) => {
    setResult({ status: "error", code, params });
    setCollapsed(false);
  };

  const expand = () => {
    setCollapsed(false);
    requestAnimationFrame(() => document.getElementById("origin")?.focus({ preventScroll: true }));
  };

  function onSubmit(e) {
    e.preventDefault();
    search(form, mode);
  }

  // "See every destination" from the weekend deals: the anywhere search for that weekend
  function searchWeekend({ from, to }) {
    const next = { ...form, from, to, trip: "return", weekend: true };
    setForm(next);
    setMode("everywhere");
    search(next, "everywhere");
  }

  async function search(form, mode) {
    const { origin, country, city, from, to, ida, vuelta, flex, max, trip, minN, maxN, weekend } = form;

    if (!/^[A-Z]{3}$/.test(origin)) return fail("badOrigin");

    let params;
    if (mode === "trip") {
      if (!ida || !vuelta || vuelta <= ida) return fail("returnBeforeOut");
      params = { origin, country, ...(city && { city }), ida, vuelta, flex };
    } else {
      if (!from || !to || from > to) return fail("rangeOrder");
      params = { origin, from, to, ...(max && { max }), ...(mode === "country" && { country, ...(city && { city }) }) };
      if (trip === "return" && weekend && mode === "everywhere") {
        Object.assign(params, { trip, weekend: 1 });
      } else if (trip === "return") {
        const [a, b] = [Number(minN), Number(maxN)];
        if (!(a >= 1 && b >= a && b <= 30)) return fail("stayInvalid");
        Object.assign(params, { trip, minN: a, maxN: b });
      }
    }
    if (mode !== "everywhere" && !country) return fail("missingCountry");

    setResult({ status: "loading", mode });
    setQuery({ mode, ...form, weekend: weekend && trip === "return" && mode === "everywhere" });
    // The search goes in the URL, so the link can be shared (lib/share)
    window.history.replaceState(null, "", `?${searchToParams(form, mode)}`);
    setCollapsed(true);
    window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
    try {
      const data = await searchFlights(mode, { ...params, lang });
      setResult({ status: "done", mode, data });
      if (EMPTY[mode](data)) setCollapsed(false);
    } catch (error) {
      const { code, params: values, retry } = apiError(error);
      fail(code, { ...values, retry });
    }
  }

  const Results = result.status === "done" && result.mode === mode ? RESULTS[mode] : null;

  return (
    <>
      <header className="relative isolate overflow-hidden bg-(image:--hero) px-4 pt-[calc(2.5rem+env(safe-area-inset-top,0px))] pb-24 text-hero-foreground sm:px-6">
        <HeroPhoto />
        <div className="mx-auto grid max-w-5xl gap-3">
          <TopBar className="mb-4 sm:mb-6" />
          <Collapse open={!collapsed}>
            <div className="grid gap-3 pb-4">
              <p className="text-xs font-semibold tracking-wide text-hero-muted uppercase sm:text-sm">{t.header.kicker}</p>
              <h1 className="font-heading text-[2.5rem] leading-[0.95] font-extrabold tracking-tight whitespace-pre-line drop-shadow-sm sm:text-6xl">
                {t.header.title}
              </h1>
              <p className="max-w-[56ch] text-base text-hero-muted sm:text-lg">{t.header.intro}</p>
            </div>
          </Collapse>
        </div>
      </header>

      <div className="relative z-10 -mt-20 px-4 sm:px-6">
        <Card
          className={cn(
            "mx-auto max-w-5xl gap-0 px-4 shadow-xl transition-[padding] duration-300 motion-reduce:transition-none sm:px-6",
            collapsed ? "py-3 sm:py-4" : "py-4 sm:py-6"
          )}
        >
          <Collapse open={collapsed}>
            <SearchSummary
              query={query}
              originName={findAirport(airports, query?.origin)?.city}
              onEdit={expand}
            />
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
                onField={onField}
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
          <EmptyState mode={mode} origin={form.origin} airports={airports} onSeeAll={searchWeekend} />
        )}
        {result.status === "loading" && <LoadingState text={t.loading[result.mode]} />}
        {result.status === "error" && (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertTitle>{t.errors.title}</AlertTitle>
            <AlertDescription>
              {errorMessage(t, result.code, result.params)}
              {result.params?.retry && ` ${t.errors.retry}`}
            </AlertDescription>
          </Alert>
        )}
        {Results && (
          <div className="grid gap-8 duration-500 animate-in fade-in slide-in-from-bottom-4 motion-reduce:animate-none">
            <Results data={result.data} />
          </div>
        )}
      </main>
    </>
  );
}

function LoadingState({ text }) {
  return (
    <div className="grid gap-4">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> {text}
      </p>
      <Skeleton className="h-40 rounded-xl" />
      <div className="grid gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// Positano (by day in the light theme, at dusk in the dark one; see .hero-photo in globals.css), blended into
// the header colour: on the right on desktop, dimmed behind the text on mobile.
// The © above the search card credits it (both licences require it).
function HeroPhoto() {
  const { t } = useI18n();
  const credit = (href, text, className) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={text}
      aria-label={text}
      className={cn(
        "absolute right-4 bottom-[6.25rem] z-10 size-6 place-items-center rounded-full bg-black/30 text-white/80 backdrop-blur-sm hover:bg-black/50 hover:text-white sm:right-6",
        className
      )}
    >
      <Copyright className="size-3.5" />
    </a>
  );
  return (
    <>
      {/* Two nested masks (fade to the bottom, then to the left) instead of one with two layers */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-35 mask-[linear-gradient(to_bottom,black_40%,transparent)] md:left-auto md:w-[72%] md:opacity-95 md:mask-[linear-gradient(to_bottom,black_55%,transparent)]"
      >
        <div className="hero-photo size-full md:mask-[linear-gradient(to_right,transparent,rgb(0_0_0/0.04)_15%,rgb(0_0_0/0.18)_30%,rgb(0_0_0/0.5)_45%,rgb(0_0_0/0.85)_58%,black_68%)]" />
      </div>
      {credit("https://commons.wikimedia.org/wiki/File:Positano_panorama.jpg", t.header.photoCreditDay, "grid dark:hidden")}
      {credit("https://commons.wikimedia.org/wiki/File:Positano_Sunset.JPG", t.header.photoCreditNight, "hidden dark:grid")}
    </>
  );
}

// Before searching: this weekend's cheapest trips; without them, what each mode does (the selected one highlighted)
function EmptyState({ mode, origin, airports, onSeeAll }) {
  const { t } = useI18n();
  const originName = findAirport(airports, origin)?.city;
  return (
    <>
      <TripsPromo />
      <WeekendDeals origin={origin} originName={originName} onSeeAll={onSeeAll} fallback={<SearchModes mode={mode} />} />
      <p className="-mt-4 text-xs text-muted-foreground">{t.empty.disclaimer}</p>
    </>
  );
}

function SearchModes({ mode }) {
  const { t } = useI18n();
  return (
    <section className="grid gap-4">
      <h2 className="font-heading text-xl font-bold tracking-tight">{t.empty.title}</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {MODES.map(({ id, icon: Icon }) => (
          <div
            key={id}
            className={cn(
              "grid content-start gap-2 rounded-xl p-4 ring-1 ring-foreground/10 transition-colors",
              id === mode ? "bg-card ring-2 ring-primary/50" : "bg-transparent opacity-70"
            )}
          >
            <Icon className={cn("size-5", id === mode ? "text-primary" : "text-muted-foreground")} />
            <p className="font-heading font-semibold">{t.modes[id].label}</p>
            <p className="text-sm text-muted-foreground">{t.modes[id].hint}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
