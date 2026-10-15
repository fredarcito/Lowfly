"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/i18n";

// Step 1's actions, in the two rows of the actions slot: "Continue →" (submits the form `formId`, which is
// elsewhere on the page) and what comes next
const ContinueAction = ({ formId }) => {
  const { texts } = useI18n();
  const labels = texts.trips.manual;
  return (
    <>
      <Button type="submit" form={formId} size="lg" className="group h-12 text-base font-bold">
        {labels.continue} <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
      </Button>
      <p className="text-center text-sm leading-5 text-muted-foreground">{labels.nextIs}</p>
    </>
  );
};

export default ContinueAction;
