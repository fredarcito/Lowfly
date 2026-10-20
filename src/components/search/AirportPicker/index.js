"use client";

import { useCallback, useMemo } from "react";
import { Loader2, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import AirportOption from "@/components/search/AirportOption";
import PickerStatus from "@/components/shared/PickerStatus";
import SearchBox from "@/components/shared/SearchBox";
import { useI18n } from "@/context/i18n";
import { useNearestAirport } from "@/components/search/AirportPicker/hooks/useNearestAirport";
import { useSearchableList } from "@/hooks/useSearchableList";
import { groupByCountry, searchAirports } from "@/utils/airports";
import CountryHeading from "@/components/search/AirportPicker/components/CountryHeading";

// The search box and the list of departure airports: by country with nothing typed (and "Use my location"),
// the best matches otherwise. Opens on the current airport. Only airports a live search runs from: the ones easyJet
// and Vueling alone fly to are destinations only (server/airports `destinationOnly`).
const AirportPicker = ({ airports, value, onPick }) => {
  const { lang, texts } = useI18n();
  const nearest = useNearestAirport();
  const departures = useMemo(() => airports.list.filter((airport) => !airport.destinationOnly), [airports.list]);
  const search = useCallback((query) => searchAirports(departures, query, lang), [departures, lang]);
  const list = useSearchableList({
    search,
    startAt: (options) => options.findIndex((airport) => airport.code === value),
    onPick: (airport) => onPick(airport.code),
  });
  const browsing = !list.query.trim();
  // Browsing: grouped by country; searching: one group without heading
  const groups = browsing ? groupByCountry(list.shown) : [{ country: "", items: list.shown.map((airport, index) => ({ airport, index })) }];

  if (airports.status !== "ok") return <PickerStatus status={airports.status} loading={texts.airport.loading} error={texts.airport.error} />;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid gap-2 p-3">
        <SearchBox
          label={texts.airport.search}
          listId={list.listId}
          activeId={list.shown[list.active] ? `${list.listId}-${list.shown[list.active].code}` : undefined}
          value={list.query}
          onChange={list.changeQuery}
          onKeyDown={list.onKeyDown}
        />
        {browsing && (
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-primary-ink"
            onClick={() => nearest.findNearest(departures, (airport) => onPick(airport.code))}
            disabled={nearest.status === "busy"}
          >
            {nearest.status === "busy" ? <Loader2 className="animate-spin" /> : <LocateFixed />}
            {nearest.status === "busy" ? texts.airport.locating : texts.airport.nearMe}
          </Button>
        )}
        {nearest.status === "error" && <p className="px-2 text-xs text-destructive">{texts.airport.locateError}</p>}
      </div>

      <div ref={list.listRef} id={list.listId} role="listbox" aria-label={texts.form.origin} className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-1.5">
        {list.shown.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">{texts.airport.none(list.query)}</p>}
        {groups.map((group) => (
          <div key={group.country || "results"} role="group" aria-label={group.country || undefined}>
            {browsing && <CountryHeading country={group.country} countryCode={group.countryCode} count={group.items.length} />}
            {group.items.map(({ airport, index }) => (
              <AirportOption
                key={airport.code}
                id={`${list.listId}-${airport.code}`}
                airport={airport}
                index={index}
                active={index === list.active}
                selected={airport.code === value}
                withCountry={!browsing}
                onPick={() => onPick(airport.code)}
                onHover={() => list.setActive(index)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AirportPicker;
