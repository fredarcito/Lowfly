"use client";

import { Luggage, PlaneLanding, PlaneTakeoff } from "lucide-react";
import BagEstimate from "@/components/shared/BagEstimate";
import DestinationGuide from "@/components/shared/DestinationGuide";
import FareLeg from "@/components/shared/FareLeg";
import { useI18n } from "@/context/i18n";
import { cheapestBagExtra } from "@/utils/baggage";
import { cn } from "@/utils/cn";
import FoldRow from "@/components/shared/CompactFareBody/components/FoldRow";
import FlightSummary from "@/components/shared/CompactFareBody/components/FlightSummary";

// A fare on phones and tablets, compact: each flight folded into a row (day and times; tap for the details),
// why go in three lines ("See more"), and the extra baggage folded with its "from" price.
// Used by the highlighted card and the opened results of the table. `firstLine`: a line above the first row.
const CompactFareBody = ({ fare, origin, firstLine = true }) => {
  const { texts, format } = useI18n();
  const bagFrom = cheapestBagExtra(fare);
  const wholeEuros = (amount) => format.money(Math.round(amount), fare.cur, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <>
      <FoldRow icon={PlaneTakeoff} summary={<FlightSummary label={texts.results.out} flight={fare.out || fare} />} className={cn(!firstLine && "border-t-0")}>
        <div className="rounded-xl bg-muted/50 p-4">
          <FareLeg fare={fare} origin={origin} direction="out" showPrice={Boolean(fare.ret)} />
        </div>
      </FoldRow>
      {fare.ret && (
        <FoldRow icon={PlaneLanding} summary={<FlightSummary label={texts.results.ret} flight={fare.ret} />}>
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
              <span>{texts.results.bagsShort}</span>
              <span className="text-muted-foreground tabular-nums">{texts.results.bagsFrom(wholeEuros(bagFrom))}</span>
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
