"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RouteStep from "@/components/trips/ManualTripForm/components/RouteStep";
import StyleStep from "@/components/trips/ManualTripForm/components/StyleStep";
import TripSteps from "@/components/trips/ManualTripForm/components/TripSteps";
import { useManualTripForm } from "@/components/trips/ManualTripForm/hooks/useManualTripForm";
import { useTripWizard } from "@/components/trips/ManualTripForm/hooks/useTripWizard";
import { useI18n } from "@/context/i18n";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

// Planning a trip by hand, in two steps on the same page: the route (towns, days and times), then the style of
// its itinerary, which the AI creates right here before the trip opens. Each step slides in from the side it
// comes from. The towns live in useManualTripForm and the steps in useTripWizard.
const ManualTripForm = () => {
  const { lang, texts } = useI18n();
  const form = useManualTripForm();
  const wizard = useTripWizard(form);
  const labels = texts.trips.manual;

  return (
    <>
      <Link href={ROUTES.trips(lang)} className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {texts.trips.backToList}
      </Link>
      <div className="grid gap-1">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{labels.title}</h1>
        <p className="max-w-[60ch] text-muted-foreground sm:text-lg">{labels.subtitle}</p>
      </div>

      <TripSteps steps={wizard.steps} current={wizard.stepIndex} />

      <div
        key={wizard.step}
        className={cn(
          "grid gap-4 duration-300 ease-out animate-in fade-in motion-reduce:animate-none",
          wizard.direction > 0 ? "slide-in-from-right-8" : "slide-in-from-left-8"
        )}
      >
        {wizard.step === "route" || !wizard.trip ? (
          <RouteStep form={form} onNext={wizard.goToStyle} />
        ) : (
          <StyleStep trip={wizard.trip} onBack={wizard.goBack} />
        )}
      </div>
    </>
  );
};

export default ManualTripForm;
