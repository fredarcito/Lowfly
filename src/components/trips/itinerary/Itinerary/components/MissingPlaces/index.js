"use client";

import { Loader2, MapPinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/i18n";

// Places the traveller asked for that are not in the itinerary, even after asking the AI twice (server/itinerary):
// say which, never leave them out in silence, and offer to make it again (with `onCreate`)
const MissingPlaces = ({ names, creating, onCreate }) => {
  const { texts } = useI18n();
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
      <p className="flex items-center gap-2 text-muted-foreground">
        <MapPinOff className="size-4 shrink-0" /> {texts.trips.missingPlaces(names)}
      </p>
      {onCreate && (
        <Button variant="ghost" size="sm" disabled={creating} onClick={onCreate} className="font-semibold">
          {creating && <Loader2 className="animate-spin" />}
          {creating ? texts.trips.aiGenerating : texts.trips.remake}
        </Button>
      )}
    </div>
  );
};

export default MissingPlaces;
