"use client";

import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import AirportField from "@/components/search/AirportField";
import DateRangeField from "@/components/search/DateRangeField";
import DestinationField from "@/components/search/DestinationField";
import FlexDaysField from "@/components/search/FlexDaysField";
import MaxPriceField from "@/components/search/MaxPriceField";
import PassengersField from "@/components/search/PassengersField";
import TripTypeField from "@/components/search/TripTypeField";
import FormField from "@/components/shared/FormField";
import { useI18n } from "@/context/i18n";
import { findAirport } from "@/hooks/useAirports";
import { isStopoverOnly } from "@/utils/destinations";
import { MAX_FREE_NIGHTS, MIN_FREE_NIGHTS } from "@/constants/multiCity";

// The longest search range for each mode (a country means many airports, so many requests)
const MAX_DAYS = { everywhere: 180, country: 120 };

// The search form of each mode: anywhere (dates and price), to a destination (also the destination), flexible
// dates (destination, the trip's dates and how many days they may move) and routes (the days you are free, 5 to 15).
// `onField(name, value)`.
const SearchForm = ({ mode, form, airports, countries, busy, onField, onSubmit }) => {
  const { texts } = useI18n();
  const shows = (...modes) => modes.includes(mode);
  const roundTrip = form.trip === "return";
  const everywhere = mode === "everywhere";
  const originName = findAirport(airports, form.origin)?.name ?? form.origin;
  // A destination reached with a stop only says so
  const withStop = isStopoverOnly(countries.list, { country: form.country, city: form.city });

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:gap-5">
      {/* The adults: in the row of options (anywhere and to a destination: the trip's; flexible dates: how many days it
          may move); the routes' form has room for it as one more field (below) */}
      {shows("everywhere", "country") && (
        <TripTypeField mode={mode} form={form} onField={onField}>
          <PassengersField id="passengers" value={form.passengers} onChange={(count) => onField("passengers", count)} />
        </TripTypeField>
      )}
      {shows("trip") && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {texts.form.flexBefore}
            <FlexDaysField id="flex" compact value={form.flex} onChange={(days) => onField("flex", days)} />
            {texts.form.flexAfter}
          </div>
          <div className="w-36">
            <PassengersField id="passengers" value={form.passengers} onChange={(count) => onField("passengers", count)} />
          </div>
        </div>
      )}
      <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-12">
        {/* Phones: no hints under the airport and the dates (their pickers only take what fits), so the form stays
            short */}
        <FormField id="origin" label={texts.form.origin} hint={texts.form.originHint} hintClassName="max-sm:hidden" className="lg:col-span-3">
          <AirportField id="origin" value={form.origin} airports={airports} onChange={(code) => onField("origin", code)} />
        </FormField>

        {shows("country", "trip") && (
          <FormField
            id="country"
            label={texts.form.country}
            hint={withStop ? texts.form.countryHintStop(originName) : texts.form.countryHint(originName)}
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
              hintClassName="max-sm:hidden"
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
            {/* "Optional": under the field, or beside its label on phones (one line less) */}
            <FormField
              id="max"
              label={texts.form.maxPrice}
              note={texts.form.optional}
              noteClassName="sm:hidden"
              hint={texts.form.optional}
              hintClassName="max-sm:hidden"
              className={everywhere ? "lg:col-span-3" : "lg:col-span-2"}
            >
              <MaxPriceField id="max" value={form.max} placeholder={texts.form.noLimit} onChange={(price) => onField("max", price)} />
            </FormField>
          </>
        )}

        {shows("multiCity") && (
          <FormField
            id="free-dates"
            label={texts.form.freeDates}
            hint={texts.form.freeDatesHint(MIN_FREE_NIGHTS + 1, MAX_FREE_NIGHTS + 1)}
            className="lg:col-span-6"
          >
            <DateRangeField
              id="free-dates"
              from={form.freeFrom}
              to={form.freeTo}
              minNights={MIN_FREE_NIGHTS}
              maxNights={MAX_FREE_NIGHTS}
              onChange={(from, to) => {
                onField("freeFrom", from);
                onField("freeTo", to);
              }}
            />
          </FormField>
        )}

        {shows("multiCity") && (
          <FormField id="passengers" label={texts.form.passengers} className="lg:col-span-3">
            <PassengersField id="passengers" value={form.passengers} onChange={(count) => onField("passengers", count)} tall />
          </FormField>
        )}

        {shows("trip") && (
          <FormField id="trip-dates" label={texts.form.tripDates} className="lg:col-span-6">
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
