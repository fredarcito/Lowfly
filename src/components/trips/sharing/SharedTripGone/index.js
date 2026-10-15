"use client";

import Link from "next/link";
import { Link2Off, PlaneTakeoff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/i18n";
import { ROUTES } from "@/constants/routes";

// A shared link that leads nowhere (turned off, or the trip deleted): say so and offer to explore
const SharedTripGone = () => {
  const { lang, texts } = useI18n();
  return (
    <div className="grid justify-items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <Link2Off className="size-5" />
      </span>
      <p className="font-heading text-xl font-bold">{texts.share.goneTitle}</p>
      <p className="max-w-[44ch] text-sm text-muted-foreground">{texts.share.goneText}</p>
      <Button asChild variant="outline" className="mt-2 h-10 rounded-full px-5 font-semibold">
        <Link href={ROUTES.home(lang)}>
          <PlaneTakeoff /> {texts.trips.exploreFlights}
        </Link>
      </Button>
    </div>
  );
};

export default SharedTripGone;
