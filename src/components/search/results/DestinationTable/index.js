"use client";

import { ChevronRight, CornerDownRight, Moon, PlaneTakeoff } from "lucide-react";
import AirlineBadge from "@/components/shared/AirlineBadge";
import { useI18n } from "@/context/i18n";
import { airlinesOf } from "@/utils/format";
import { cn } from "@/utils/cn";
import { noTimeOff } from "@/utils/weekend";

// Same columns for the header and every row.
// Phone and tablet: destination and price on top, dates and stay below. Desktop: one column each.
const ROW_GRID =
  "grid grid-cols-[minmax(0,1fr)_auto_1rem] items-center gap-x-4 gap-y-2 px-4 py-3 [grid-template-areas:'dest_price_go''when_when_when'] sm:px-5 " +
  "lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.3fr)_9rem_9.5rem_1rem] lg:[grid-template-areas:'dest_dates_stay_price_go']";

function NoTimeOffTag() {
  const { t } = useI18n();
  return (
    <span title={t.results.noTimeOffHint} className="rounded-full bg-save/15 px-2 py-0.5 text-xs font-medium text-save">
      {t.results.noTimeOff}
    </span>
  );
}

function Pill({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium whitespace-nowrap">
      <Icon className="size-3.5 text-muted-foreground" />
      {children}
    </span>
  );
}

// Travel dates and stay: "Fri 16 Oct → Mon 19 Oct" + "3 nights".
// Weekend trips add the times and the hours there; one way shows the departure (and arrival) time instead of the stay.
function TripCells({ fare, weekend }) {
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
}

function Chevron() {
  return (
    <ChevronRight className="size-4 text-muted-foreground transition-transform [grid-area:go] group-hover:translate-x-0.5" />
  );
}

// One destination. The whole row opens the booking on the airline website.
function DestinationRow({ fare, href, weekend }) {
  const { f } = useI18n();
  return (
    <a
      className={cn(ROW_GRID, "group transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none")}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="grid min-w-0 gap-1 [grid-area:dest]">
        <span className="truncate font-heading text-base font-semibold group-hover:underline">
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
      <Chevron />
    </a>
  );
}

// A second option under a destination: the cheapest weekend there that needs no time off
function AlternativeRow({ fare, href }) {
  const { f } = useI18n();
  return (
    <a
      className={cn(
        ROW_GRID,
        "group pt-0 text-muted-foreground transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none",
      )}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
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
      <Chevron />
    </a>
  );
}

// Destinations sorted by price: destination, travel dates, stay and price
export default function DestinationTable({ fares, origin, roundTrip, weekend }) {
  const { t, f } = useI18n();
  const results = t.results;
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
      {fares.map((fare) => (
        <div key={fare.code}>
          <DestinationRow fare={fare} href={f.fareLinks(fare, origin)[0].href} weekend={weekend} />
          {fare.noTimeOffAlt && (
            <AlternativeRow fare={fare.noTimeOffAlt} href={f.fareLinks(fare.noTimeOffAlt, origin)[0].href} />
          )}
        </div>
      ))}
    </div>
  );
}
