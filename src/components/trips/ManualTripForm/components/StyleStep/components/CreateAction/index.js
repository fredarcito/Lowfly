"use client";

import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/i18n";

// Step 2's actions, in the two rows of the actions slot: "← Back" to the route beside "✨ Create itinerary", and
// leaving it for later (`onSkip`). While the AI works (`creating`) they wait, disabled; without free itineraries
// left (`canCreate` false) only Back stays (signing in is shown in the step).
const CreateAction = ({ onBack, onCreate, onSkip, creating = false, canCreate = true }) => {
  const { texts } = useI18n();
  return (
    <>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="lg" onClick={onBack} disabled={creating} className="h-12 shrink-0 px-4 font-semibold">
          <ArrowLeft /> {texts.trips.manual.back}
        </Button>
        {canCreate && (
          <Button type="button" size="lg" onClick={onCreate} disabled={creating} className="group h-12 min-w-0 flex-1 text-base font-bold">
            {creating ? <Loader2 className="animate-spin" /> : <Sparkles className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />}
            {creating ? texts.trips.aiGenerating : texts.trips.aiGenerate}
          </Button>
        )}
      </div>
      <button
        type="button"
        onClick={onSkip}
        disabled={creating}
        className="w-fit justify-self-center rounded-sm text-sm leading-5 text-muted-foreground underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:invisible"
      >
        {texts.trips.manual.skip}
      </button>
    </>
  );
};

export default CreateAction;
