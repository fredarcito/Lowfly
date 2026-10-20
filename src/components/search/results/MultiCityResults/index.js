"use client";

import { ChevronDown, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import FailedNote from "@/components/search/results/FailedNote";
import KindChips from "@/components/search/results/KindChips";
import RouteCard from "@/components/search/results/MultiCityResults/components/RouteCard";
import { useRouteFilter } from "@/components/search/results/MultiCityResults/hooks/useRouteFilter";
import { useI18n } from "@/context/i18n";
import { findAirport, useAirports } from "@/hooks/useAirports";

// The "Recorridos" search's results (server/multiCity, docs/multi-city.md): a few routes for the days you are free,
// each a card; a filter by length when there are several, and "see more" past the first few
const MultiCityResults = ({ data }) => {
  const { lang, texts } = useI18n();
  const labels = texts.multiCity;
  const airports = useAirports(lang);
  const { origin, routes, failed } = data;
  const { filter, choose, versions, shown, hidden, matching, showAll } = useRouteFilter(routes);
  const originName = findAirport(airports, origin)?.city ?? origin;

  if (!routes.length) {
    return (
      <>
        <div className="grid justify-items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
          <Route className="size-8 text-muted-foreground" />
          <p className="max-w-[50ch] text-sm text-muted-foreground">{labels.empty}</p>
        </div>
        <FailedNote failed={failed} />
      </>
    );
  }

  const filters = [{ value: "all", label: labels.filter.all }, ...versions.map((version) => ({ value: version, label: labels.filter[version] }))];

  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="grid gap-1">
          <h2 className="font-heading text-2xl font-bold tracking-tight">{labels.title}</h2>
          <p className="max-w-[65ch] text-sm text-muted-foreground">{labels.subtitle(originName)}</p>
        </div>
        {versions.length > 1 && <KindChips label={labels.filterAria} options={filters} value={filter} onChange={choose} />}
      </div>
      <FailedNote failed={failed} />

      {matching.length ? (
        <div className="grid gap-6">
          {shown.map((route) => (
            // A new filter starts every card on its version
            <RouteCard key={`${route.id}-${filter}`} route={route} origin={origin} preferred={filter === "all" ? null : filter} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed px-6 py-8 text-center text-sm text-muted-foreground">{labels.noneInFilter}</p>
      )}

      {hidden > 0 && (
        <Button variant="outline" size="lg" onClick={showAll} className="h-11 justify-self-center">
          {labels.seeMore(hidden)}
          <ChevronDown />
        </Button>
      )}
      <p className="text-xs text-muted-foreground">{labels.landNote}</p>
    </section>
  );
};

export default MultiCityResults;
