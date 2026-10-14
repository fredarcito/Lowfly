"use client";

import { ChevronDown } from "lucide-react";
import TripCard from "@/components/trips/TripCard";
import { useI18n } from "@/context/i18n";
import { useDisclosure } from "@/hooks/useDisclosure";
import { cn } from "@/utils/cn";

// Trips already over, folded away at the end of the list
export default function PastTrips({ trips }) {
  const { t } = useI18n();
  const section = useDisclosure();
  if (!trips.length) return null;
  return (
    <section className="grid gap-3 border-t pt-6">
      <button
        type="button"
        onClick={section.toggle}
        aria-expanded={section.open}
        className="flex w-fit items-center gap-1.5 font-heading text-lg font-semibold"
      >
        {t.trips.past(trips.length)}
        <ChevronDown className={cn("size-4 transition-transform", section.open && "rotate-180")} />
      </button>
      {section.open && (
        <div className="grid gap-3 opacity-80">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </section>
  );
}
