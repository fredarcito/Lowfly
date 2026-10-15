"use client";

import AirlineBadge from "@/components/shared/AirlineBadge";
import { useI18n } from "@/context/i18n";
import { airlinesOf } from "@/utils/format";
import { cn } from "@/utils/cn";
import { noTimeOff } from "@/utils/weekend";
import { ROW_BUTTON, ROW_GRID } from "@/components/search/results/DestinationTable/resources/rowStyles";
import NoTimeOffTag from "@/components/search/results/DestinationTable/components/NoTimeOffTag";
import TripCells from "@/components/search/results/DestinationTable/components/TripCells";
import Chevron from "@/components/search/results/DestinationTable/components/Chevron";

// One destination; pressing it opens the details
const DestinationRow = ({ fare, weekend, open, onToggle }) => {
  const { format } = useI18n();
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
        {format.money(fare.price, fare.cur)}
      </span>
      <Chevron open={open} />
    </button>
  );
};

export default DestinationRow;
