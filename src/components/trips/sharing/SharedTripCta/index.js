"use client";

import Link from "next/link";
import { Plane, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import SaveSharedTripButton from "@/components/trips/sharing/SaveSharedTripButton";
import { useI18n } from "@/context/i18n";
import { APP_NAME } from "@/i18n/config";
import { ROUTES } from "@/constants/routes";

// The end of a shared trip: keep it, or make one's own; and where it was planned
const SharedTripCta = ({ trip }) => {
  const { lang, texts } = useI18n();
  return (
    <>
      <section className="relative isolate mt-4 grid items-center gap-6 overflow-hidden rounded-2xl bg-card p-6 ring-1 ring-foreground/10 sm:p-8 md:grid-cols-[minmax(0,1fr)_auto]">
        {/* A soft coral glow behind the corner, as on the itinerary's create card */}
        <span aria-hidden className="absolute -top-24 -right-24 -z-10 size-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="flex gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary-ink">
            <Sparkles className="size-6" />
          </span>
          <div className="grid gap-1.5">
            <h2 className="font-heading text-2xl font-extrabold tracking-tight">{texts.share.likeIt}</h2>
            <p className="max-w-[52ch] text-muted-foreground">{texts.share.likeItText}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 max-md:pl-16 max-sm:pl-0">
          <SaveSharedTripButton trip={trip} className="max-sm:flex-1" />
          <Button asChild variant="outline" className="h-11 px-5 font-semibold max-sm:flex-1">
            <Link href={ROUTES.home(lang)}>{texts.share.createOwn}</Link>
          </Button>
        </div>
      </section>
      <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        {texts.share.plannedWith}
        <Link href={ROUTES.home(lang)} className="flex items-center gap-1.5 font-heading font-extrabold text-foreground">
          <span className="grid size-6 place-items-center rounded-md bg-primary text-primary-foreground">
            <Plane className="size-3.5 -rotate-45" />
          </span>
          {APP_NAME}
        </Link>
      </p>
    </>
  );
};

export default SharedTripCta;
