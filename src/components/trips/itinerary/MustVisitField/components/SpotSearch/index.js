"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import SpotResults from "@/components/trips/itinerary/MustVisitField/components/SpotResults";
import { MIN_LETTERS, useSpotSearch } from "@/components/trips/itinerary/MustVisitField/hooks/useSpotSearch";
import { listKeyDown } from "@/utils/listKeys";
import { cn } from "@/utils/cn";

// How long the list stays after leaving the box, so a click on a result lands first
const CLOSE_DELAY_MS = 150;

// A search box for places around the trip's destination, with the matches under it (useSpotSearch). Picking one
// calls `onPick(spot)` and empties the box. `onNotInList(text)`: the last option, for a place we did not find.
// `onType(text)`: what is typed, as it is typed. `areas`: only towns and neighbourhoods. `label`: its name when no
// <label> points to it. `compact`: chip-sized, in a row of chips. `onDismiss`: left empty (or Escape on an empty box).
const SpotSearch = ({ id, label, placeholder, near, town, areas = false, onPick, onNotInList, onType, onDismiss, autoFocus = false, compact = false }) => {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);
  const results = useSpotSearch(query, { near, town, areas });
  const searched = query.trim();
  const showList = open && searched.length >= MIN_LETTERS && results.status !== "idle";
  const withNotInList = Boolean(onNotInList) && results.status !== "loading";
  const count = results.list.length + (withNotInList ? 1 : 0);

  // New results: the first one highlighted
  useEffect(() => setActive(0), [results.list]);

  const pick = (spot) => {
    onPick(spot);
    setQuery("");
    onType?.("");
    setOpen(false);
  };

  const notInList = () => {
    setOpen(false);
    onNotInList(searched);
  };

  const onKeyDown = listKeyDown({
    count,
    active,
    setActive,
    onPick: (index) => (index < results.list.length ? pick(results.list[index]) : notInList()),
    onMove: () => setOpen(true),
    onClose: () => (searched || showList ? setOpen(false) : onDismiss?.()),
    canPick: showList,
  });

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id}
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label={label}
        aria-activedescendant={showList && active < count ? `${listId}-${active}` : undefined}
        autoComplete="off"
        spellCheck={false}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className={cn("pl-9 text-base md:text-sm", compact ? "h-10 rounded-full bg-card dark:bg-card" : "h-11")}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          onType?.(event.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          // Back in the box before the list closed (typing right after removing a chip): it stays open
          clearTimeout(closeTimer.current);
          setOpen(true);
        }}
        onBlur={(event) => {
          const left = event.target.value.trim();
          closeTimer.current = setTimeout(() => {
            setOpen(false);
            if (!left) onDismiss?.();
          }, CLOSE_DELAY_MS);
        }}
        onKeyDown={onKeyDown}
      />
      {showList && (
        <SpotResults
          listId={listId}
          results={results}
          query={searched}
          active={active}
          onPick={pick}
          onNotInList={withNotInList ? notInList : null}
          onHover={setActive}
        />
      )}
    </div>
  );
};

export default SpotSearch;
