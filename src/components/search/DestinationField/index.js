"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Loader2, MapPin, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useI18n } from "@/context/i18n";
import { flag, normalize } from "@/utils/format";
import { useDesktop } from "@/hooks/useDesktop";
import { cn } from "@/utils/cn";

// countries: [{ name, countryCode, codes, cities: [{ name, codes }] }]
// Every option is a whole country (city null) or one of its cities. With a query, only the matches:
// a country whose name matches keeps all its cities, otherwise only the cities (or airport codes) that match.
function optionsFor(countries, query) {
  const searched = normalize(query.trim());
  const options = [];
  for (const country of countries) {
    const countryMatches = !searched || normalize(country.name).includes(searched);
    const cities = countryMatches
      ? country.cities
      : country.cities.filter(
          (city) => normalize(city.name).includes(searched) || city.codes.some((code) => code.toLowerCase() === searched)
        );
    if (!countryMatches && !cities.length) continue;
    options.push({ country, city: null });
    // A country with a single city: the country option already searches it
    if (country.cities.length > 1) cities.forEach((city) => options.push({ country, city }));
  }
  return options;
}

const optionKey = (option) => `${option.country.name}|${option.city?.name ?? ""}`;

function DestinationPicker({ countries, value, onPick }) {
  const { t } = useI18n();
  const listId = useId();
  const listRef = useRef(null);
  const [query, setQuery] = useState("");
  const shown = useMemo(() => optionsFor(countries.list, query), [countries.list, query]);
  const selectedKey = `${value.country}|${value.city}`;
  // Starts on the current destination, so the list opens scrolled to it
  const [active, setActive] = useState(() => Math.max(0, shown.findIndex((option) => optionKey(option) === selectedKey)));

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const pick = (option) => onPick({ country: option.country.name, city: option.city?.name ?? "" });

  function onKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((index) => Math.min(shown.length - 1, Math.max(0, index + step)));
    } else if (event.key === "Enter" && shown[active]) {
      event.preventDefault();
      pick(shown[active]);
    }
  }

  if (countries.status !== "ok") {
    return (
      <p className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
        {countries.status === "loading" && <Loader2 className="size-4 animate-spin" />}
        {countries.status === "loading" ? t.form.countryLoading : t.form.countryError}
      </p>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative p-3">
        <Search className="pointer-events-none absolute top-1/2 left-6 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          type="search"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={shown[active] ? `${listId}-${active}` : undefined}
          aria-label={t.destination.search}
          placeholder={t.destination.search}
          autoComplete="off"
          spellCheck={false}
          className="h-11 pl-9 text-base md:text-sm"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
        />
      </div>

      <div ref={listRef} id={listId} role="listbox" aria-label={t.form.country} className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-1.5">
        {shown.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">{t.destination.none(query)}</p>}
        {shown.map((option, index) => {
          const { country, city } = option;
          const selected = optionKey(option) === selectedKey;
          return (
            <div
              key={optionKey(option)}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={selected}
              data-index={index}
              onClick={() => pick(option)}
              onPointerMove={() => setActive(index)}
              className={cn(
                "my-0.5 flex cursor-pointer items-center gap-3 rounded-md py-2 pr-2.5",
                city ? "pl-9" : "pl-2.5",
                index === active && "bg-accent",
                selected && "text-primary-ink"
              )}
            >
              {city ? (
                <>
                  <span className="min-w-0 flex-1 truncate">{city.name}</span>
                  <span className="shrink-0 text-xs font-semibold tracking-widest text-muted-foreground">{city.codes.join(" · ")}</span>
                </>
              ) : (
                <>
                  <span className="text-base leading-none">{flag(country.countryCode)}</span>
                  <span className="grid min-w-0 flex-1">
                    <span className="truncate font-semibold">{country.name}</span>
                    {country.cities.length > 1 && (
                      <span className="truncate text-xs text-muted-foreground">{t.destination.wholeCountry}</span>
                    )}
                  </span>
                  {country.cities.length > 1 ? (
                    <span className="shrink-0 text-xs text-muted-foreground">{t.form.airports(country.codes.length)}</span>
                  ) : (
                    <span className="shrink-0 text-xs font-semibold tracking-widest text-muted-foreground">{country.codes.join(" · ")}</span>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Destination: a whole country or one of its cities. A button that opens a searchable list
// (popover on desktop, bottom sheet on mobile). value: { country, city } (city "" = the whole country)
export default function DestinationField({ id, value, countries, onChange }) {
  const { t } = useI18n();
  const desktop = useDesktop();
  const [open, setOpen] = useState(false);
  const country = countries.list.find((candidate) => candidate.name === value.country);
  const placeholder = { loading: t.form.countryLoading, error: t.form.countryError }[countries.status] || t.form.countryChoose;

  const pick = (destination) => {
    onChange(destination);
    setOpen(false);
  };

  const trigger = (
    <Button
      id={id}
      variant="outline"
      disabled={countries.status !== "ok"}
      className="h-11 w-full justify-start gap-2 px-3 text-left text-base font-normal md:text-sm"
    >
      {country ? <span className="text-base leading-none">{flag(country.countryCode)}</span> : <MapPin className="text-muted-foreground" />}
      {value.country ? (
        <span className="min-w-0 flex-1 truncate">{value.city ? `${value.city}, ${value.country}` : value.country}</span>
      ) : (
        <span className="text-muted-foreground">{placeholder}</span>
      )}
    </Button>
  );

  const picker = <DestinationPicker countries={countries} value={value} onPick={pick} />;

  if (desktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent align="start" className="flex max-h-[min(28rem,var(--radix-popover-content-available-height))] w-80 gap-0 p-0">
          {picker}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="h-[85dvh] overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 pt-3">
          <SheetTitle>{t.destination.title}</SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="-mr-2 size-9" aria-label={t.picker.close}>
              <X />
            </Button>
          </SheetClose>
        </div>
        <SheetDescription className="sr-only">{t.destination.search}</SheetDescription>
        {picker}
      </SheetContent>
    </Sheet>
  );
}
