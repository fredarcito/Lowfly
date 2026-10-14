"use client";

import { useState } from "react";
import { ChevronDown, CornerDownRight, Moon, PlaneTakeoff } from "lucide-react";
import FareDetails from "@/components/search/results/FareDetails";
import AirlineBadge from "@/components/shared/AirlineBadge";
import Collapse from "@/components/shared/Collapse";
import { useI18n } from "@/context/i18n";
import { airlinesOf } from "@/utils/format";
import { cn } from "@/utils/cn";
import { noTimeOff } from "@/utils/weekend";

// Same columns for the header and every row.
// Phone and tablet: destination and price on top, dates and stay below. Desktop: one column each.
const ROW_GRID =
  "grid grid-cols-[minmax(0,1fr)_auto_1rem] items-center gap-x-4 gap-y-2 px-4 py-3 [grid-template-areas:'dest_price_go''when_when_when'] sm:px-5 " +
  "lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.3fr)_9rem_9.5rem_1rem] lg:[grid-template-areas:'dest_dates_stay_price_go']";

// A row is a button that opens its details (flights, booking, save) below it
const ROW_BUTTON =
  "w-full text-left transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none aria-expanded:bg-muted/40";

const NoTimeOffTag = () => {
  const { t } = useI18n();
  return (
    <span title={t.results.noTimeOffHint} className="rounded-full bg-save/15 px-2 py-0.5 text-xs font-medium text-save">
      {t.results.noTimeOff}
    </span>
  );
};

const Pill = ({ icon: Icon, children }) => {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium whitespace-nowrap">
      <Icon className="size-3.5 text-muted-foreground" />
      {children}
    </span>
  );
};

// Travel dates and stay: "Fri 16 Oct → Mon 19 Oct" + "3 nights".
// Weekend trips add the times and the hours there; one way shows the departure (and arrival) time instead of the stay.
const TripCells = ({ fare, weekend }) => {
  const { t, f } = useI18n();
  const dates = !fare.ret
    ? f.fmtDay(fare.day)
    : weekend
      ? `${f.fmtShort(fare.day)} ${fare.time} → ${f.fmtShort(fare.ret.day)} ${fare.ret.time}`
      : `${f.fmtDay(fare.day)} → ${f.fmtDay(fare.ret.day)}`;
  const showHours = fare.hours && fare.nights <= 3;

  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5 [grid-area:when] lg:contents">
      <span className="text-sm first-letter:uppercase lg:[grid-area:dates]">{dates}</span>
      <span className="lg:[grid-area:stay]">
        {fare.ret ? (
          <Pill icon={Moon}>
            {t.units.nights(fare.nights)}
            {showHours && ` · ${fare.hours} h`}
          </Pill>
        ) : (
          fare.time && (
            <Pill icon={PlaneTakeoff}>
              {fare.time}
              {fare.arrive && ` → ${fare.arrive}`}
            </Pill>
          )
        )}
      </span>
    </span>
  );
};

const Chevron = ({ open }) => {
  return <ChevronDown className={cn("size-4 text-muted-foreground transition-transform [grid-area:go]", open && "rotate-180")} />;
};

// One destination; pressing it opens the details
const DestinationRow = ({ fare, weekend, open, onToggle }) => {
  const { f } = useI18n();
  return (
    <button type="button" onClick={onToggle} aria-expanded={open} className={cn(ROW_GRID, ROW_BUTTON, "group")}>
      <span className="grid min-w-0 gap-1 [grid-area:dest]">
        <span className="truncate font-heading text-base font-semibold">
          {fare.city}, {fare.country}
        </span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          {airlinesOf(fare).map((airline) => (
            <AirlineBadge key={airline} airline={airline} />
          ))}
          <span className="text-xs font-semibold tracking-wider">· {fare.code}</span>
          {weekend && noTimeOff(fare) && <NoTimeOffTag />}
        </span>
      </span>
      <TripCells fare={fare} weekend={weekend} />
      <span className="text-right font-heading text-xl font-extrabold tabular-nums [grid-area:price]">
        {f.money(fare.price, fare.cur)}
      </span>
      <Chevron open={open} />
    </button>
  );
};

// A second option under a destination: the cheapest weekend there that needs no time off
const AlternativeRow = ({ fare, open, onToggle }) => {
  const { f } = useI18n();
  return (
    <button type="button" onClick={onToggle} aria-expanded={open} className={cn(ROW_GRID, ROW_BUTTON, "pt-0 text-muted-foreground")}>
      <span className="flex min-w-0 flex-wrap items-center gap-2 pl-1 [grid-area:dest]">
        <CornerDownRight className="size-3.5 shrink-0" />
        <NoTimeOffTag />
        {airlinesOf(fare).map((airline) => (
          <AirlineBadge key={airline} airline={airline} />
        ))}
      </span>
      <TripCells fare={fare} weekend />
      <span className="text-right font-heading font-bold text-foreground tabular-nums [grid-area:price]">
        {f.money(fare.price, fare.cur)}
      </span>
      <Chevron open={open} />
    </button>
  );
};

// Destinations sorted by price: destination, travel dates, stay and price.
// One row open at a time, showing its flights with "Book" and "Save trip".
const DestinationTable = ({ fares, origin, roundTrip, weekend }) => {
  const { t } = useI18n();
  const results = t.results;
  const [openKey, setOpenKey] = useState(null);
  const toggle = (key) => setOpenKey((current) => (current === key ? null : key));

  return (
    <div className="divide-y overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <div
        aria-hidden
        className={cn(
          ROW_GRID,
          "hidden bg-muted/50 py-2.5 text-xs font-semibold tracking-wider whitespace-nowrap text-muted-foreground uppercase lg:grid",
        )}
      >
        <span className="[grid-area:dest]">{results.colDestination}</span>
        <span className="[grid-area:dates]">{results.colDates}</span>
        <span className="[grid-area:stay]">{roundTrip ? results.colStay : results.colDeparture}</span>
        <span className="text-right [grid-area:price]">{roundTrip ? results.colPriceReturn : results.colPriceOneway}</span>
      </div>
      {fares.map((fare) => {
        // The alternative only has the flights: it is the same destination
        const alternative = fare.noTimeOffAlt && { code: fare.code, city: fare.city, country: fare.country, ...fare.noTimeOffAlt };
        const altKey = `${fare.code}-alt`;
        return (
          <div key={fare.code}>
            <DestinationRow fare={fare} weekend={weekend} open={openKey === fare.code} onToggle={() => toggle(fare.code)} />
            <Collapse open={openKey === fare.code}>
              <div className="border-t border-foreground/10 bg-muted/40 pt-4">
                <FareDetails fare={fare} origin={origin} />
              </div>
            </Collapse>
            {alternative && (
              <>
                <AlternativeRow fare={alternative} open={openKey === altKey} onToggle={() => toggle(altKey)} />
                <Collapse open={openKey === altKey}>
                  <div className="border-t border-foreground/10 bg-muted/40 pt-4">
                    <FareDetails fare={alternative} origin={origin} />
                  </div>
                </Collapse>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DestinationTable;
