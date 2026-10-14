"use client";

import { ArrowLeftRight, ArrowRight, Loader2, Luggage, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import AirportField from "@/components/search/AirportField";
import DateRangeField from "@/components/search/DateRangeField";
import { useI18n } from "@/context/i18n";

const MAX_DAYS = { everywhere: 180, country: 120 };

function Field({ id, label, hint, className = "", children }) {
  return (
    <div className={`grid min-w-0 content-start gap-1.5 ${className}`}>
      <Label htmlFor={id} className="text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

// One way / return, and how many nights you want to stay (or, anywhere, only weekends away: lib/weekend)
function TripType({ mode, form, onField }) {
  const { t } = useI18n();
  const roundTrip = form.trip === "return";
  const weekendOption = roundTrip && mode === "everywhere";
  const weekend = weekendOption && form.weekend;
  const nights = (name, label) => (
    <Input
      type="number"
      min="1"
      max="30"
      inputMode="numeric"
      aria-label={label}
      className="h-9 w-14 text-center"
      value={form[name]}
      onChange={(e) => onField(name, e.target.value)}
    />
  );

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <ToggleGroup
        type="single"
        variant="outline"
        spacing={0}
        value={form.trip}
        onValueChange={(v) => v && onField("trip", v)}
        aria-label={t.form.tripType}
      >
        <ToggleGroupItem value="oneway" className="h-9 px-3">
          <ArrowRight /> {t.form.oneway}
        </ToggleGroupItem>
        <ToggleGroupItem value="return" className="h-9 px-3">
          <ArrowLeftRight /> {t.form.roundTrip}
        </ToggleGroupItem>
      </ToggleGroup>
      {weekendOption && (
        <Toggle
          variant="outline"
          size="lg"
          pressed={form.weekend}
          onPressedChange={(v) => onField("weekend", v)}
          className="h-9 px-3"
        >
          <Luggage /> {t.form.weekendOnly}
        </Toggle>
      )}
      {weekend && <p className="text-sm text-muted-foreground">{t.form.weekendHint}</p>}
      {roundTrip && !weekend && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {t.form.stayBefore} {nights("minN", t.form.minNights)} {t.form.stayBetween} {nights("maxN", t.form.maxNights)}{" "}
          {t.form.stayAfter}
        </div>
      )}
    </div>
  );
}

export default function SearchForm({ mode, form, airports, countries, busy, onField, onSubmit }) {
  const { t } = useI18n();
  const show = (...modes) => modes.includes(mode);
  const roundTrip = form.trip === "return";
  const countryPlaceholder = { loading: t.form.countryLoading, error: t.form.countryError }[countries.status] || t.form.countryChoose;

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      {show("everywhere", "country") && <TripType mode={mode} form={form} onField={onField} />}
      <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-12">
        <Field id="origin" label={t.form.origin} hint={t.form.originHint} className="lg:col-span-3">
          <AirportField id="origin" value={form.origin} airports={airports} onChange={(code) => onField("origin", code)} />
        </Field>

        {show("country", "trip") && (
          <Field
            id="country"
            label={t.form.country}
            hint={t.form.countryHint(airports.list.find((a) => a.code === form.origin)?.name ?? form.origin)}
            className="lg:col-span-3">
            <Select
              value={form.country || undefined}
              onValueChange={(v) => onField("country", v)}
              disabled={countries.status !== "ok"}
            >
              <SelectTrigger id="country" className="h-11! w-full min-w-0 text-base md:text-sm">
                <SelectValue placeholder={countryPlaceholder}>{form.country}</SelectValue>
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-80">
                {countries.list.map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    {c.name}
                    <span className="text-muted-foreground">· {t.form.airports(c.count)}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}

        {show("everywhere", "country") && (
          <Field
            id="dates"
            label={roundTrip ? t.form.datesReturn : t.form.datesOneway}
            hint={roundTrip ? t.form.datesHintReturn(MAX_DAYS[mode]) : t.form.datesHintOneway(MAX_DAYS[mode])}
            className={mode === "everywhere" ? "lg:col-span-6" : "lg:col-span-4"}
          >
            <DateRangeField
              id="dates"
              from={form.from}
              to={form.to}
              maxNights={MAX_DAYS[mode] - 1}
              onChange={(from, to) => {
                onField("from", from);
                onField("to", to);
              }}
            />
          </Field>
        )}

        {show("everywhere", "country") && (
          <Field id="max" label={t.form.maxPrice} hint={t.form.optional} className={mode === "everywhere" ? "lg:col-span-3" : "lg:col-span-2"}>
            <div className="relative">
              <Input
                id="max"
                type="number"
                min="1"
                inputMode="numeric"
                placeholder={t.form.noLimit}
                className="h-11 pr-8"
                value={form.max}
                onChange={(e) => onField("max", e.target.value)}
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">€</span>
            </div>
          </Field>
        )}

        {show("trip") && (
          <>
            <Field id="trip-dates" label={t.form.tripDates} className="lg:col-span-4">
              <DateRangeField
                id="trip-dates"
                unit="nights"
                minNights={1}
                from={form.ida}
                to={form.vuelta}
                onChange={(ida, vuelta) => {
                  onField("ida", ida);
                  onField("vuelta", vuelta);
                }}
              />
            </Field>
            <Field id="flex" label={t.form.flex} className="lg:col-span-2">
              <ToggleGroup
                id="flex"
                type="single"
                variant="outline"
                spacing={0}
                value={form.flex}
                onValueChange={(v) => v && onField("flex", v)}
                className="h-11 w-full"
                aria-label={t.form.flexAria}
              >
                {[1, 2, 3].map((d) => (
                  <ToggleGroupItem key={d} value={String(d)} className="h-11 flex-1" aria-label={t.form.flexOptionAria(d)}>
                    {t.form.flexShort(d)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>
          </>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{t.modes[mode].hint}</p>
        <Button type="submit" size="lg" disabled={busy} className="h-11 shrink-0 px-6 text-base font-bold">
          {busy ? <Loader2 className="animate-spin" /> : <Search />}
          {busy ? t.form.searching : t.form.search}
        </Button>
      </div>
    </form>
  );
}
