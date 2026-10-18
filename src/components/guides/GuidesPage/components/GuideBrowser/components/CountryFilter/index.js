"use client";

import { useCallback, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import ListPickerPopover from "@/components/shared/ListPickerPopover";
import SearchBox from "@/components/shared/SearchBox";
import { useSearchableList } from "@/hooks/useSearchableList";
import { normalize } from "@/utils/format";
import { cn } from "@/utils/cn";

// The guides' country, picked the way the flight search picks a destination: a popover under the field on
// desktop, a sheet from the bottom on phones, with a search box and the keyboard (ListPickerPopover). `countries`:
// their names, sorted; `value`: the one picked, or "" for all; `texts`: the guides' list words.
const CountryFilter = ({ countries, value, onChange, texts }) => {
  const [open, setOpen] = useState(false);
  // "All countries" first, then each one: [{ name, label }] (name "" = all)
  const search = useCallback(
    (query) => {
      const typed = normalize(query.trim());
      const matching = countries.filter((country) => !typed || normalize(country).includes(typed)).map((country) => ({ name: country, label: country }));
      return typed ? matching : [{ name: "", label: texts.allCountries }, ...matching];
    },
    [countries, texts.allCountries]
  );
  const pick = (option) => {
    onChange(option.name);
    setOpen(false);
  };
  const list = useSearchableList({ search, startAt: (options) => options.findIndex((option) => option.name === value), onPick: pick });

  const trigger = (
    <Button variant="outline" className="h-12 w-full justify-start gap-3 rounded-xl bg-card px-4 text-left text-sm font-normal">
      <Globe className="size-4.5 text-muted-foreground" />
      <span className={cn("min-w-0 flex-1 truncate", !value && "text-muted-foreground")}>{value || texts.allCountries}</span>
      <ChevronDown className="size-4 text-muted-foreground" />
    </Button>
  );

  return (
    <ListPickerPopover open={open} onOpenChange={setOpen} trigger={trigger} title={texts.country} description={texts.countrySearch}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="p-3">
          <SearchBox
            label={texts.countrySearch}
            listId={list.listId}
            activeId={list.shown[list.active] ? `${list.listId}-${list.active}` : undefined}
            value={list.query}
            onChange={list.changeQuery}
            onKeyDown={list.onKeyDown}
          />
        </div>
        <div ref={list.listRef} id={list.listId} role="listbox" aria-label={texts.country} className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-1.5">
          {list.shown.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">{texts.noCountry}</p>}
          {list.shown.map((option, index) => (
            <div
              key={option.name || "all"}
              id={`${list.listId}-${index}`}
              role="option"
              aria-selected={option.name === value}
              data-index={index}
              onClick={() => pick(option)}
              onPointerMove={() => list.setActive(index)}
              className={cn(
                "my-0.5 flex cursor-pointer items-center justify-between gap-3 rounded-md px-2.5 py-2 text-sm",
                index === list.active && "bg-accent",
                option.name === value && "font-semibold text-primary-ink"
              )}
            >
              {option.label}
              {option.name === value && <Check className="size-4" />}
            </div>
          ))}
        </div>
      </div>
    </ListPickerPopover>
  );
};

export default CountryFilter;
