"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ActionsSlot from "@/components/trips/ManualTripForm/components/ActionsSlot";
import ContinueAction from "@/components/trips/ManualTripForm/components/RouteStep/components/ContinueAction";
import CreateAction from "@/components/trips/ManualTripForm/components/StyleStep/components/CreateAction";
import BottomBar from "@/components/trips/ManualTripForm/components/BottomBar";
import RouteLine from "@/components/trips/ManualTripForm/components/RouteLine";
import RouteStep from "@/components/trips/ManualTripForm/components/RouteStep";
import RouteSummary from "@/components/trips/ManualTripForm/components/RouteSummary";
import StyleStep from "@/components/trips/ManualTripForm/components/StyleStep";
import TripSteps from "@/components/trips/ManualTripForm/components/TripSteps";
import { useManualTripForm } from "@/components/trips/ManualTripForm/hooks/useManualTripForm";
import { useStyleStep } from "@/components/trips/ManualTripForm/hooks/useStyleStep";
import { useTripWizard } from "@/components/trips/ManualTripForm/hooks/useTripWizard";
import { ROUTE_FORM_ID } from "@/components/trips/ManualTripForm/resources/formIds";
import { useI18n } from "@/context/i18n";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

// Planning a trip by hand, in two steps on the same page: the route (towns, days and times), then the style of
// its itinerary, which the AI creates right here before the trip opens. The route's summary (desktop) and the
// bottom bar (phones) belong to the whole wizard and never change place: only the actions inside them change
// with the step, in a box of fixed height. Only the step's own column slides in, from the side it comes from.
// The towns live in useManualTripForm, the steps in useTripWizard and step 2's state in useStyleStep.
const ManualTripForm = () => {
  const { lang, texts } = useI18n();
  const form = useManualTripForm();
  const wizard = useTripWizard(form);
  const style = useStyleStep(wizard.trip);
  const labels = texts.trips.manual;
  const onStyle = wizard.step === "style" && Boolean(wizard.trip);
  const enterClassName = cn(
    "duration-300 ease-out animate-in fade-in motion-reduce:animate-none",
    wizard.direction > 0 ? "slide-in-from-right-8" : "slide-in-from-left-8"
  );
  const actions = (
    <ActionsSlot>
      {onStyle ? (
        <CreateAction onBack={wizard.goBack} onCreate={style.create} onSkip={style.skip} creating={style.creating} canCreate={!style.needsAccount} />
      ) : (
        <ContinueAction formId={ROUTE_FORM_ID} />
      )}
    </ActionsSlot>
  );

  return (
    <>
      {/* Back to My trips (back to the route is beside "Create itinerary" in step 2) */}
      <Link href={ROUTES.trips(lang)} className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {texts.trips.backToList}
      </Link>
      {/* Each step its own title, fading in when it changes */}
      <div key={`heading-${wizard.step}`} className="grid gap-1 duration-500 animate-in fade-in motion-reduce:animate-none">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{onStyle ? labels.styleTitle : labels.title}</h1>
        <p className="max-w-[60ch] text-muted-foreground sm:text-lg">{onStyle ? labels.styleSubtitle : labels.subtitle}</p>
      </div>

      <TripSteps steps={wizard.steps} current={wizard.stepIndex} progress={form.completion} />

      {/* Phones: room at the bottom for the fixed bar */}
      <div className="grid items-start gap-6 max-lg:pb-48 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {onStyle ? (
          <StyleStep key="style" trip={wizard.trip} style={style} enterClassName={enterClassName} />
        ) : (
          <RouteStep key="route" form={form} onNext={wizard.goToStyle} enterClassName={enterClassName} />
        )}
        <RouteSummary form={form}>
          {actions}
        </RouteSummary>
      </div>
      <BottomBar summary={<RouteLine form={form} />}>{actions}</BottomBar>
    </>
  );
};

export default ManualTripForm;
