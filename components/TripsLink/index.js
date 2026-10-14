"use client";

import Link from "next/link";
import { TicketsPlane } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";
import { isUpcoming, useTrips } from "@/lib/trips";
import { cn } from "@/lib/utils";

// "My trips" in the header, with how many upcoming trips there are
export default function TripsLink({ className }) {
  const { lang, t } = useI18n();
  const upcoming = useTrips().filter(isUpcoming).length;
  return (
    <Link
      href={`/${lang}/viajes`}
      title={t.trips.title}
      aria-label={upcoming ? `${t.trips.title} (${upcoming})` : t.trips.title}
      className={cn(
        "relative grid size-9 shrink-0 place-items-center rounded-full bg-hero-chip text-hero-muted transition-colors hover:text-hero-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        className
      )}
    >
      <TicketsPlane className="size-4" />
      {upcoming > 0 && (
        <span className="absolute -top-1 -right-1 grid min-w-4.5 place-items-center rounded-full bg-primary px-1 text-[10px] leading-4.5 font-bold text-primary-foreground tabular-nums">
          {upcoming}
        </span>
      )}
    </Link>
  );
}

