"use client";

import Link from "next/link";
import { ArrowRight, Luggage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/i18n";
import { useTrips } from "@/hooks/useTrips";
import { ROUTES } from "@/constants/routes";

// Under the search: what My trips holds and a way in. With no trips yet, it explains how to save one.
const TripsPromo = () => {
  const { lang, texts } = useI18n();
  const hasTrips = useTrips().length > 0;
  return (
    <section className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-y py-4">
      <div className="flex min-w-0 items-center gap-3">
        <Luggage className="size-8 shrink-0 text-primary-ink" strokeWidth={1.75} />
        <div className="grid gap-0.5">
          <h2 className="font-heading text-lg leading-tight font-bold tracking-tight">{texts.trips.promoTitle}</h2>
          <p className="text-sm text-muted-foreground">{hasTrips ? texts.trips.promoText : texts.trips.promoEmpty}</p>
        </div>
      </div>
      <Button asChild variant="outline" className="h-10 rounded-full px-5 font-semibold max-sm:w-full">
        <Link href={ROUTES.trips(lang)}>
          {texts.trips.promoAction}
          <ArrowRight />
        </Link>
      </Button>
    </section>
  );
};

export default TripsPromo;
