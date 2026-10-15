"use client";

import { useI18n } from "@/context/i18n";
import { flag } from "@/utils/format";

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

export default CountryLine;
