"use client";

import { Languages, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/i18n";

// An AI itinerary made in another language: say so, and offer to make it again in this one (with `onCreate`)
const OtherLanguage = ({ itinerary, creating, onCreate }) => {
  const { lang, texts } = useI18n();
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
      <p className="flex items-center gap-2 text-muted-foreground">
        <Languages className="size-4 shrink-0" /> {texts.trips.inLanguage(texts.trips.languageNames[itinerary.lang])}
      </p>
      {onCreate && (
        <Button variant="ghost" size="sm" disabled={creating} onClick={onCreate} className="font-semibold">
          {creating && <Loader2 className="animate-spin" />}
          {creating ? texts.trips.aiGenerating : texts.trips.createIn(texts.trips.languageNames[lang])}
        </Button>
      )}
    </div>
  );
};

export default OtherLanguage;
