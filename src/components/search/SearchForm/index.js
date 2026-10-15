"use client";

import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import AirportField from "@/components/search/AirportField";
import DateRangeField from "@/components/search/DateRangeField";
import DestinationField from "@/components/search/DestinationField";
import FlexDaysField from "@/components/search/FlexDaysField";
import MaxPriceField from "@/components/search/MaxPriceField";
import TripTypeField from "@/components/search/TripTypeField";
import FormField from "@/components/shared/FormField";
import { useI18n } from "@/context/i18n";
import { findAirport } from "@/hooks/useAirports";

// The longest search range for each mode (a country means many airports, so many requests)
const MAX_DAYS = { everywhere: 180, country: 120 };

// The search form of each mode: anywhere (dates and price), to a destination (also the destination) and
// flexible dates (destination, the trip's dates and how many days they may move). `onField(name, value)`.
const SearchForm = ({ mode, form, airports, countries, busy, onField, onSubmit }) => {
  const { texts } = useI18n();
  const shows = (...modes) => modes.includes(mode);
  const roundTrip = form.trip === "return";
  const everywhere = mode === "everywhere";

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      {shows("everywhere", "country") && <TripTypeField mode={mode} form={form} onField={onField} />}
      <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-12">
        <FormField id="origin" label={texts.form.origin} hint={texts.form.originHint} className="lg:col-span-3">
          <AirportField id="origin" value={form.origin} airports={airports} onChange={(code) => onField("origin", code)} />
        </FormField>

        {shows("country", "trip") && (
          <FormField
            id="country"
            label={texts.form.country}
            hint={texts.form.countryHint(findAirport(airports, form.origin)?.name ?? form.origin)}
            className="lg:col-span-3"
          >
            <DestinationField
              id="country"
              value={{ country: form.country, city: form.city }}
              countries={countries}
              onChange={({ country, city }) => {
                onField("country", country);
                onField("city", city);
              }}
            />
          </FormField>
        )}

        {shows("everywhere", "country") && (
          <>
            <FormField
              id="dates"
              label={roundTrip ? texts.form.datesReturn : texts.form.datesOneway}
              hint={roundTrip ? texts.form.datesHintReturn(MAX_DAYS[mode]) : texts.form.datesHintOneway(MAX_DAYS[mode])}
              className={everywhere ? "lg:col-span-6" : "lg:col-span-4"}
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
            </FormField>
            <FormField id="max" label={texts.form.maxPrice} hint={texts.form.optional} className={everywhere ? "lg:col-span-3" : "lg:col-span-2"}>
              <MaxPriceField id="max" value={form.max} placeholder={texts.form.noLimit} onChange={(price) => onField("max", price)} />
            </FormField>
          </>
        )}

        {shows("trip") && (
          <>
            <FormField id="trip-dates" label={texts.form.tripDates} className="lg:col-span-4">
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
            </FormField>
            <FormField id="flex" label={texts.form.flex} className="lg:col-span-2">
              <FlexDaysField id="flex" value={form.flex} onChange={(days) => onField("flex", days)} />
            </FormField>
          </>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{texts.modes[mode].hint}</p>
        <Button type="submit" size="lg" disabled={busy} className="h-11 shrink-0 px-6 text-base font-bold">
          {busy ? <Loader2 className="animate-spin" /> : <Search />}
          {busy ? texts.form.searching : texts.form.search}
        </Button>
      </div>
    </form>
  );
};

export default SearchForm;
