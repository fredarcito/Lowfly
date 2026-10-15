"use client";

import { useCallback } from "react";
import DestinationOption from "@/components/search/DestinationOption";
import PickerStatus from "@/components/shared/PickerStatus";
import SearchBox from "@/components/shared/SearchBox";
import { useI18n } from "@/context/i18n";
import { useSearchableList } from "@/hooks/useSearchableList";
import { destinationKey, destinationOptions } from "@/utils/destinations";

// The search box and the list of destinations: each country and its cities (utils/destinations).
// Opens on the current destination. value: { country, city } (city "" = the whole country)
const DestinationPicker = ({ countries, value, onPick }) => {
  const { texts } = useI18n();
  const selectedKey = destinationKey(value);
  const search = useCallback((query) => destinationOptions(countries.list, query), [countries.list]);
  const pick = (option) => onPick({ country: option.country.name, city: option.city?.name ?? "" });
  const list = useSearchableList({
    search,
    startAt: (options) => options.findIndex((option) => destinationKey(option) === selectedKey),
    onPick: pick,
  });

  if (countries.status !== "ok") return <PickerStatus status={countries.status} loading={texts.form.countryLoading} error={texts.form.countryError} />;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="p-3">
        <SearchBox
          label={texts.destination.search}
          listId={list.listId}
          activeId={list.shown[list.active] ? `${list.listId}-${list.active}` : undefined}
          value={list.query}
          onChange={list.changeQuery}
          onKeyDown={list.onKeyDown}
        />
      </div>

      <div ref={list.listRef} id={list.listId} role="listbox" aria-label={texts.form.country} className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-1.5">
        {list.shown.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">{texts.destination.none(list.query)}</p>}
        {list.shown.map((option, index) => (
          <DestinationOption
            key={destinationKey(option)}
            id={`${list.listId}-${index}`}
            option={option}
            index={index}
            active={index === list.active}
            selected={destinationKey(option) === selectedKey}
            onPick={() => pick(option)}
            onHover={() => list.setActive(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default DestinationPicker;
