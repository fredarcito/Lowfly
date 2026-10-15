"use client";

import { Luggage } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { BAGS } from "@/constants/baggage";
import { bagExtra } from "@/utils/baggage";
import { airlineNames } from "@/utils/format";
import { cn } from "@/utils/cn";

// The note under the prices (a key of texts.results): once booked, how to add a bag; otherwise where the final
// price is, shorter in the large version
const NOTES = { booked: "bagsAfterBooking", large: "bagsFinalPriceShort", regular: "bagsFinalPrice" };

// What a bag adds to a fare, so its real cost is no surprise when booking (the fares only include a small
// bag under the seat): "Estimated extra baggage · Cabin 10 kg +€12 · Checked 20 kg +€21", for both flights
// on a return trip, and where the final price is. The hint says they are estimates.
// `large`: for the highlighted card (bigger text, prices to the edge, a line above the note).
// `hideTitle`: when a folded row above already says it (the compact card on phones).
// `booked`: the flights are booked already, so the note says how to add a bag now.
const BagEstimate = ({ fare, large = false, hideTitle = false, booked = false, className }) => {
  const note = NOTES[["booked", "large"].find((variant) => ({ booked, large })[variant]) ?? "regular"];
  const { texts, format } = useI18n();
  const extras = Object.keys(BAGS)
    .map((kind) => ({ kind, extra: bagExtra(fare, kind) }))
    .filter((estimate) => estimate.extra != null);
  if (!extras.length) return null;
  const wholeEuros = (amount) => format.money(Math.round(amount), fare.cur, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div
      className={cn("grid content-start text-muted-foreground", large ? "gap-2.5" : "gap-1 text-sm", className)}
      title={texts.results.bagsHint}
    >
      {!hideTitle && (
        <p className={cn("flex items-center text-foreground", large ? "gap-2.5" : "gap-1.5")}>
          <Luggage className={cn("shrink-0 text-muted-foreground", large ? "size-5" : "size-4")} />
          {texts.results.bagsTitle}
        </p>
      )}
      <dl className={cn("grid grid-cols-[1fr_auto] gap-x-6", large ? "gap-y-1.5 pl-7.5" : "max-w-72 gap-y-0.5 pl-5.5")}>
        {extras.map(({ kind, extra }) => (
          <div key={kind} className="contents">
            <dt className="whitespace-nowrap">{texts.results.bag[kind](BAGS[kind].kg)}</dt>
            <dd className="text-right font-medium whitespace-nowrap text-foreground tabular-nums">+{wholeEuros(extra)}</dd>
          </div>
        ))}
      </dl>
      <p className={cn("text-xs", large ? "ml-7.5 border-t pt-2.5" : "pl-5.5")}>
        {fare.ret && `${texts.results.bagsBothFlights} `}
        {texts.results[note](airlineNames(fare))}
      </p>
      <span className="sr-only">{texts.results.bagsHint}</span>
    </div>
  );
};

export default BagEstimate;
