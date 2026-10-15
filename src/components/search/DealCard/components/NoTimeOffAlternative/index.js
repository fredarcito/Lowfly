"use client";

import { ArrowRight, CornerDownRight } from "lucide-react";
import { useI18n } from "@/context/i18n";

// The cheaper trip of the same destination that needs no time off work, as a strip at the bottom of the card
const NoTimeOffAlternative = ({ fare, origin }) => {
  const { texts, format } = useI18n();
  return (
    <a
      href={format.fareLinks(fare, origin)[0].href}
      target="_blank"
      rel="noopener noreferrer"
      title={`${texts.results.noTimeOffHint} · ${format.weekendDates(fare)}`}
      className="relative z-10 -mx-4 -mb-4 flex items-center gap-2 border-t bg-save/10 px-4 py-2 text-xs font-medium text-save hover:bg-save/20"
    >
      <CornerDownRight className="size-3.5" />
      {texts.deals.noTimeOffFrom(format.money(fare.price, fare.cur))}
      <ArrowRight className="ml-auto size-3.5" />
    </a>
  );
};

export default NoTimeOffAlternative;
