"use client";

import { useState } from "react";
import { ChevronDown, Luggage, PlaneLanding, PlaneTakeoff } from "lucide-react";
import BagEstimate from "@/components/shared/BagEstimate";
import Collapse from "@/components/shared/Collapse";
import DestinationGuide from "@/components/shared/DestinationGuide";
import { FareLeg } from "@/components/shared/FareLegs";
import { useI18n } from "@/context/i18n";
import { cheapestBagExtra } from "@/utils/baggage";
import { cn } from "@/utils/cn";

// A row that unfolds what is under it (a flight, the baggage)
const FoldRow = ({ icon: Icon, summary, children, className }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("border-t", className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center gap-3 py-3.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Icon className="size-5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1">{summary}</span>
        <ChevronDown className={cn("size-5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      <Collapse open={open}>
        <div className="pb-4">{children}</div>
      </Collapse>
    </div>
  );
};

// "OUT · Fri 23 Oct · 16:25 → 17:20": the day and the times are what decide a flight (the route is above)
const FlightSummary = ({ label, flight }) => {
  const { f } = useI18n();
  return (
    <span className="flex flex-wrap items-baseline gap-x-2">
      <span className="font-heading font-bold uppercase">{label}</span>
      <span className="text-muted-foreground first-letter:uppercase">{f.fmtDay(flight.day)}</span>
      <span className="font-medium tabular-nums">
        {flight.time}
        {flight.arrive && ` → ${flight.arrive}`}
      </span>
    </span>
  );
};

// A fare on phones and tablets, compact: each flight folded into a row (day and times; tap for the details),
// why go in three lines ("See more"), and the extra baggage folded with its "from" price.
// Used by the highlighted card and the opened results of the table. `firstLine`: a line above the first row.
const CompactFareBody = ({ fare, origin, firstLine = true }) => {
  const { t, f } = useI18n();
  const bagFrom = cheapestBagExtra(fare);
  const wholeEuros = (amount) => f.money(Math.round(amount), fare.cur, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <>
      <FoldRow icon={PlaneTakeoff} summary={<FlightSummary label={t.results.out} flight={fare.out || fare} />} className={cn(!firstLine && "border-t-0")}>
        <div className="rounded-xl bg-muted/50 p-4">
          <FareLeg fare={fare} origin={origin} direction="out" showPrice={Boolean(fare.ret)} />
        </div>
      </FoldRow>
      {fare.ret && (
        <FoldRow icon={PlaneLanding} summary={<FlightSummary label={t.results.ret} flight={fare.ret} />}>
          <div className="rounded-xl bg-muted/50 p-4">
            <FareLeg fare={fare} origin={origin} direction="ret" />
          </div>
        </FoldRow>
      )}

      <DestinationGuide code={fare.code} collapsible className="border-t pt-4" />

      {bagFrom != null && (
        <FoldRow
          icon={Luggage}
          summary={
            <span className="flex flex-wrap items-baseline gap-x-2">
              <span>{t.results.bagsShort}</span>
              <span className="text-muted-foreground tabular-nums">{t.results.bagsFrom(wholeEuros(bagFrom))}</span>
            </span>
          }
        >
          <BagEstimate fare={fare} hideTitle className="pl-8" />
        </FoldRow>
      )}
    </>
  );
};

export default CompactFareBody;
