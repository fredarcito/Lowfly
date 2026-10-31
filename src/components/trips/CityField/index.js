"use client";

import { useId, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import PlaceChip from "@/components/trips/PlaceChip";
import PlaceResults from "@/components/trips/PlaceResults";
import { useI18n } from "@/context/i18n";
import { MIN_LETTERS, usePlaceSearch } from "@/components/trips/CityField/hooks/usePlaceSearch";
import { useHighlighted } from "@/hooks/useHighlighted";
import { listKeyDown } from "@/utils/listKeys";

// How long the list stays after leaving the box, so a click on a result lands first
const CLOSE_DELAY_MS = 150;

// A town or city for a trip planned by hand: type and pick one of the matches (names in the page language,
// big cities first; usePlaceSearch). Once picked it shows as a chip that can be changed.
// value: a place from /api/places, or null
const CityField = ({ id, value, onChange, invalid = false }) => {
  const { lang, texts } = useI18n();
  const listId = useId();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = usePlaceSearch(query, lang);

  // New results: the first one highlighted
  const [active, setActive] = useHighlighted(results.list);

  const pick = (place) => {
    onChange(place);
    setQuery("");
    setOpen(false);
  };

  const pickAnother = () => {
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

  if (value) return <PlaceChip place={value} onChange={pickAnother} />;

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
        placeholder={texts.trips.manual.cityPlaceholder}
        className="h-11 pl-9 text-base md:text-sm"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), CLOSE_DELAY_MS)}
        onKeyDown={onKeyDown}
      />
      {showList && <PlaceResults listId={listId} results={results} query={query.trim()} active={active} onPick={pick} onHover={setActive} />}
    </div>
  );
};

export default CityField;
