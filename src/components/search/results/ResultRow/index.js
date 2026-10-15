"use client";

import { ChevronDown } from "lucide-react";
import FareDetails from "@/components/search/results/FareDetails";
import AirlineBadge from "@/components/shared/AirlineBadge";
import Collapse from "@/components/shared/Collapse";
import { useI18n } from "@/context/i18n";
import { useDisclosure } from "@/hooks/useDisclosure";
import { cn } from "@/utils/cn";

// A row inside a <ResultList>. Pressing it opens the details: each flight, "Book" and "Save trip".
// `fare` needs city and country (for saving); `airlines` is the list of airlines
// (two if outbound and return are with different airlines); `tag` is an optional highlight ({ label, hint })
const ResultRow = ({ fare, origin, title, meta, airlines = [], priceNote, tag }) => {
  const { format } = useI18n();
  const details = useDisclosure();
  return (
    <div>
      <button
        type="button"
        onClick={details.toggle}
        aria-expanded={details.open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none aria-expanded:bg-muted/40 sm:px-5"
      >
        <span className="grid min-w-0 flex-1 gap-1">
          <span className="truncate font-heading text-base font-semibold">{title}</span>
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            {airlines.map((airline) => (
              <AirlineBadge key={airline} airline={airline} />
            ))}
            {tag && (
              <span title={tag.hint} className="rounded-full bg-save/15 px-2 py-0.5 text-xs font-medium text-save">
                {tag.label}
              </span>
            )}
            {meta}
          </span>
        </span>
        <span className="grid justify-items-end">
          <span className="font-heading text-xl font-extrabold tabular-nums">{format.money(fare.price, fare.cur)}</span>
          {priceNote && <span className="text-xs text-muted-foreground">{priceNote}</span>}
        </span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", details.open && "rotate-180")} />
      </button>
      <Collapse open={details.open}>
        <div className="bg-muted/40 pt-1">
          <FareDetails fare={fare} origin={origin} />
        </div>
      </Collapse>
    </div>
  );
};

export default ResultRow;

export const ResultList = ({ children }) => {
  return <div className="divide-y overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">{children}</div>;
};
