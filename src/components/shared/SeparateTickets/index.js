"use client";

import { Info } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { cn } from "@/utils/cn";

// Every flight is a ticket of its own: how many, and that a missed connection is not the airline's to fix
const SeparateTickets = ({ count, className }) => {
  const { texts } = useI18n();
  return (
    <p className={cn("flex items-start gap-2.5 text-sm", className)}>
      <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <span>
        {texts.results.separateCount(count)}
        <span className="block text-xs text-muted-foreground">{texts.results.separateDetail}</span>
      </span>
    </p>
  );
};

export default SeparateTickets;
