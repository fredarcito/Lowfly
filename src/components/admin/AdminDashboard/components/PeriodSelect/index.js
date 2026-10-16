"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, ChevronDown, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAdmin } from "@/components/admin/hooks/useAdmin";

// The overview's period (7, 30 or 90 days, or all time), kept in the address (?period=) so a reload or a shared
// link shows the same; the figures are read again for it
const PeriodSelect = ({ period, periods }) => {
  const { texts } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, startLoading] = useTransition();
  const pick = (next) => startLoading(() => router.push(`${pathname}?period=${next}`, { scroll: false }));
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={texts.period.label}
        className="flex h-11 shrink-0 items-center gap-2.5 rounded-lg border border-input bg-card px-3.5 text-sm font-medium outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {loading ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : <CalendarDays className="size-4 text-muted-foreground" />}
        {texts.period.options[period]}
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuRadioGroup value={period} onValueChange={pick}>
          {periods.map((option) => (
            <DropdownMenuRadioItem key={option} value={option}>
              {texts.period.options[option]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PeriodSelect;
