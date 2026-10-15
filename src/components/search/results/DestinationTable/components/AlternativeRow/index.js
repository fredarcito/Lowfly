"use client";

import { CornerDownRight } from "lucide-react";
import AirlineBadge from "@/components/shared/AirlineBadge";
import { useI18n } from "@/context/i18n";
import { airlinesOf } from "@/utils/format";
import { cn } from "@/utils/cn";
import { ROW_BUTTON, ROW_GRID } from "@/components/search/results/DestinationTable/resources/rowStyles";
import NoTimeOffTag from "@/components/search/results/DestinationTable/components/NoTimeOffTag";
import TripCells from "@/components/search/results/DestinationTable/components/TripCells";
import Chevron from "@/components/search/results/DestinationTable/components/Chevron";

// A second option under a destination: the cheapest weekend there that needs no time off
const AlternativeRow = ({ fare, open, onToggle }) => {
  const { format } = useI18n();
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
        {format.money(fare.price, fare.cur)}
      </span>
      <Chevron open={open} />
    </button>
  );
};

export default AlternativeRow;
