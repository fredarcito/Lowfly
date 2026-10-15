"use client";

import { useI18n } from "@/context/i18n";
import { flag } from "@/utils/format";
import { cn } from "@/utils/cn";

// A city in the destination picker: its name and airport codes, indented under its country
const CityLine = ({ city }) => (
  <>
    <span className="min-w-0 flex-1 truncate">{city.name}</span>
    <span className="shrink-0 text-xs font-semibold tracking-widest text-muted-foreground">{city.codes.join(" · ")}</span>
  </>
);

// A whole country: flag, name and, when it has several cities, "the whole country" and how many airports
const CountryLine = ({ country }) => {
  const { texts } = useI18n();
  const severalCities = country.cities.length > 1;
  return (
    <>
      <span className="text-base leading-none">{flag(country.countryCode)}</span>
      <span className="grid min-w-0 flex-1">
        <span className="truncate font-semibold">{country.name}</span>
        {severalCities && <span className="truncate text-xs text-muted-foreground">{texts.destination.wholeCountry}</span>}
      </span>
      {severalCities ? (
        <span className="shrink-0 text-xs text-muted-foreground">{texts.form.airports(country.codes.length)}</span>
      ) : (
        <span className="shrink-0 text-xs font-semibold tracking-widest text-muted-foreground">{country.codes.join(" · ")}</span>
      )}
    </>
  );
};

// One option of the destination picker: a whole country or one of its cities
const DestinationOption = ({ id, option, index, active, selected, onPick, onHover }) => (
  <div
    id={id}
    role="option"
    aria-selected={selected}
    data-index={index}
    onClick={onPick}
    onPointerMove={onHover}
    className={cn(
      "my-0.5 flex cursor-pointer items-center gap-3 rounded-md py-2 pr-2.5",
      option.city ? "pl-9" : "pl-2.5",
      active && "bg-accent",
      selected && "text-primary-ink"
    )}
  >
    {option.city ? <CityLine city={option.city} /> : <CountryLine country={option.country} />}
  </div>
);

export default DestinationOption;
