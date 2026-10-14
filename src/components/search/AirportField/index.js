"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Loader2, LocateFixed, PlaneTakeoff, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useI18n } from "@/context/i18n";
import { flag, normalize } from "@/utils/format";
import { useDesktop } from "@/hooks/useDesktop";
import { cn } from "@/utils/cn";

// Distance in km between two points (haversine)
function km(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

// With no query: every airport, by country and city. With a query: exact code first, then names that start with it.
function filter(list, query, lang) {
  const q = normalize(query.trim());
  const sorted = [...list].sort((a, b) => a.country.localeCompare(b.country, lang) || a.name.localeCompare(b.name, lang));
  if (!q) return sorted;
  const rank = (a) => {
    if (a.code.toLowerCase() === q) return 0;
    if (normalize(a.city).startsWith(q) || normalize(a.name).startsWith(q)) return 1;
    if (normalize(a.country).startsWith(q)) return 2;
    return 3;
  };
  return sorted
    .filter((a) => normalize(`${a.code} ${a.name} ${a.city} ${a.country}`).includes(q))
    .sort((a, b) => rank(a) - rank(b));
}

// Search box + list of airports, with keyboard navigation. Shared by the popover and the sheet.
function AirportPicker({ airports, value, onPick }) {
  const { lang, t } = useI18n();
  const listId = useId();
  const listRef = useRef(null);
  const [query, setQuery] = useState("");
  // Starts on the current airport, so the list opens scrolled to it
  const [active, setActive] = useState(() => Math.max(0, filter(airports.list, "", lang).findIndex((a) => a.code === value)));
  const [locate, setLocate] = useState("idle");

  const shown = useMemo(() => filter(airports.list, query, lang), [airports.list, query, lang]);
  const grouped = !query.trim();
  // Consecutive airports of the same country (with a query, a single group without heading)
  const groups = useMemo(() => {
    const list = [];
    shown.forEach((a, i) => {
      const last = list.at(-1);
      if (last && (!grouped || last.country === a.country)) last.items.push({ a, i });
      else list.push({ country: a.country, countryCode: a.countryCode, items: [{ a, i }] });
    });
    return list;
  }, [shown, grouped]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function onKeyDown(e) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => Math.min(shown.length - 1, Math.max(0, i + step)));
    } else if (e.key === "Enter" && shown[active]) {
      e.preventDefault();
      onPick(shown[active].code);
    }
  }

  function nearMe() {
    setLocate("busy");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const here = { lat: coords.latitude, lon: coords.longitude };
        const nearest = airports.list
          .filter((a) => a.lat != null)
          .reduce((best, a) => (!best || km(here, a) < km(here, best) ? a : best), null);
        setLocate("idle");
        if (nearest) onPick(nearest.code);
      },
      () => setLocate("error"),
      { timeout: 10000, maximumAge: 600000 }
    );
  }

  if (airports.status !== "ok") {
    return (
      <p className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
        {airports.status === "loading" && <Loader2 className="size-4 animate-spin" />}
        {airports.status === "loading" ? t.airport.loading : t.airport.error}
      </p>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid gap-2 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            type="search"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={shown[active] ? `${listId}-${shown[active].code}` : undefined}
            aria-label={t.airport.search}
            placeholder={t.airport.search}
            autoComplete="off"
            spellCheck={false}
            className="h-11 pl-9 text-base md:text-sm"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
          />
        </div>
        {grouped && (
          <Button variant="ghost" size="sm" className="justify-start text-primary-ink" onClick={nearMe} disabled={locate === "busy"}>
            {locate === "busy" ? <Loader2 className="animate-spin" /> : <LocateFixed />}
            {locate === "busy" ? t.airport.locating : t.airport.nearMe}
          </Button>
        )}
        {locate === "error" && <p className="px-2 text-xs text-destructive">{t.airport.locateError}</p>}
      </div>

      <div ref={listRef} id={listId} role="listbox" aria-label={t.form.origin} className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-1.5">
        {shown.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">{t.airport.none(query)}</p>}
        {groups.map((g) => (
          <div key={g.country} role="group" aria-label={g.country}>
            {grouped && (
              <div
                aria-hidden="true"
                className="sticky top-0 z-10 -mx-1.5 mt-1 flex items-center gap-2 border-y border-border bg-muted px-4 py-1.5 first:mt-0"
              >
                <span className="text-base leading-none">{flag(g.countryCode)}</span>
                <span className="font-heading text-sm font-semibold">{g.country}</span>
                <span className="ml-auto text-xs text-muted-foreground tabular-nums">{g.items.length}</span>
              </div>
            )}
            {g.items.map(({ a, i }) => (
              <div
                key={a.code}
                id={`${listId}-${a.code}`}
                role="option"
                aria-selected={a.code === value}
                data-index={i}
                onClick={() => onPick(a.code)}
                onPointerMove={() => setActive(i)}
                className={cn(
                  "my-0.5 flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2",
                  i === active && "bg-accent",
                  a.code === value && "text-primary-ink"
                )}
              >
                <span className="grid min-w-0 flex-1">
                  <span className="truncate">{a.name}</span>
                  {!grouped && (
                    <span className="truncate text-xs text-muted-foreground">
                      {flag(a.countryCode)} {a.country}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs font-semibold tracking-widest text-muted-foreground">{a.code}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Departure airport: a button that opens a searchable list (popover on desktop, bottom sheet on mobile)
export default function AirportField({ id, value, airports, onChange }) {
  const { t } = useI18n();
  const desktop = useDesktop();
  const [open, setOpen] = useState(false);
  const current = airports.list.find((a) => a.code === value);

  const pick = (code) => {
    onChange(code);
    setOpen(false);
  };

  const trigger = (
    <Button id={id} variant="outline" className="h-11 w-full justify-start gap-2 px-3 text-left text-base font-normal md:text-sm">
      <PlaneTakeoff className="text-muted-foreground" />
      {value ? (
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate">{current?.name ?? value}</span>
          <span className="ml-auto shrink-0 text-xs font-semibold tracking-widest text-muted-foreground">{value}</span>
        </span>
      ) : (
        <span className="text-muted-foreground">{t.airport.choose}</span>
      )}
    </Button>
  );

  const picker = <AirportPicker airports={airports} value={value} onPick={pick} />;

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
          <SheetTitle>{t.airport.title}</SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="-mr-2 size-9" aria-label={t.picker.close}>
              <X />
            </Button>
          </SheetClose>
        </div>
        <SheetDescription className="sr-only">{t.airport.search}</SheetDescription>
        {picker}
      </SheetContent>
    </Sheet>
  );
}
