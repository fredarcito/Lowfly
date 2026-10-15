"use client";

import { useState } from "react";
import FareDetails from "@/components/search/results/FareDetails";
import Collapse from "@/components/shared/Collapse";
import { useI18n } from "@/context/i18n";
import { cn } from "@/utils/cn";
import { ROW_GRID } from "@/components/search/results/DestinationTable/resources/rowStyles";
import DestinationRow from "@/components/search/results/DestinationTable/components/DestinationRow";
import AlternativeRow from "@/components/search/results/DestinationTable/components/AlternativeRow";

// Destinations sorted by price: destination, travel dates, stay and price.
// One row open at a time, showing its flights with "Book" and "Save trip".
const DestinationTable = ({ fares, origin, roundTrip, weekend }) => {
  const { texts } = useI18n();
  const results = texts.results;
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
