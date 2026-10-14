"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Loader2, MapPin, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/context/i18n";
import { isCancelled } from "@/api/client";
import { searchPlaces } from "@/api/places";
import { flag } from "@/utils/format";
import { listKeyDown } from "@/utils/listKeys";
import { cn } from "@/utils/cn";

const SEARCH_DELAY_MS = 250;
const MIN_LETTERS = 2;

// A town or city for a trip planned by hand: type and pick one of the matches (names in the page language,
// big cities first). Once picked it shows as a chip that can be changed. value: a place from /api/places, or null
const CityField = ({ id, value, onChange, invalid = false }) => {
  const { lang, t } = useI18n();
  const listId = useId();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ status: "idle", list: [] });
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  // Search while typing, a moment after the last key; a newer search cancels the previous one
  useEffect(() => {
    const searched = query.trim();
    if (searched.length < MIN_LETTERS) {
      setResults({ status: "idle", list: [] });
      return;
    }
    const request = new AbortController();
    setResults((current) => ({ ...current, status: "loading" }));
    const timer = setTimeout(() => {
      searchPlaces(searched, lang, { signal: request.signal })
        .then((list) => {
          setResults({ status: "ok", list });
          setActive(0);
        })
        .catch((error) => !isCancelled(error) && setResults({ status: "error", list: [] }));
    }, SEARCH_DELAY_MS);
    return () => {
      clearTimeout(timer);
      request.abort();
    };
  }, [query, lang]);

  const pick = (place) => {
    onChange(place);
    setQuery("");
    setOpen(false);
  };

  const change = () => {
    onChange(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const onKeyDown = listKeyDown({
    count: results.list.length,
    active,
    setActive,
    onPick: (index) => pick(results.list[index]),
    onMove: () => setOpen(true),
    onClose: () => setOpen(false),
    canPick: open,
  });

  if (value) {
    return (
      <div className="flex h-11 items-center gap-2 rounded-lg border bg-muted/40 pr-1 pl-3">
        <span className="text-base leading-none">{flag(value.countryCode) || <MapPin className="size-4 text-muted-foreground" />}</span>
        <span className="min-w-0 flex-1 truncate">
          <span className="font-medium">{value.name}</span>
          <span className="text-sm text-muted-foreground"> · {[value.region, value.country].filter(Boolean).join(", ")}</span>
        </span>
        <Button type="button" variant="ghost" size="icon" className="size-9 shrink-0" onClick={change} aria-label={t.trips.manual.changeCity}>
          <X />
        </Button>
      </div>
    );
  }

  const showList = open && query.trim().length >= MIN_LETTERS && results.status !== "idle";
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        id={id}
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && results.list[active] ? `${listId}-${active}` : undefined}
        aria-invalid={invalid || undefined}
        autoComplete="off"
        spellCheck={false}
        placeholder={t.trips.manual.cityPlaceholder}
        className="h-11 pl-9 text-base md:text-sm"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        // Late enough for a click on a result to land first
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDown}
      />
      {showList && (
        <div
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-lg bg-popover p-1 shadow-lg ring-1 ring-foreground/10"
        >
          {results.status === "loading" && !results.list.length && (
            <p className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> {t.trips.manual.citySearching}
            </p>
          )}
          {results.status === "error" && <p className="p-3 text-sm text-destructive">{t.trips.manual.cityError}</p>}
          {results.status === "ok" && !results.list.length && (
            <p className="p-3 text-sm text-muted-foreground">{t.trips.manual.cityNone(query.trim())}</p>
          )}
          {results.list.map((place, index) => (
            <div
              key={place.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => pick(place)}
              onPointerMove={() => setActive(index)}
              className={cn("flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2", index === active && "bg-accent")}
            >
              <span className="text-base leading-none">{flag(place.countryCode)}</span>
              <span className="grid min-w-0">
                <span className="truncate font-medium">{place.name}</span>
                <span className="truncate text-xs text-muted-foreground">{[place.region, place.country].filter(Boolean).join(", ")}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CityField;
