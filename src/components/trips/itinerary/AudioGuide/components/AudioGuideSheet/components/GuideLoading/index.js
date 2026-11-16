"use client";

import { LoaderCircle } from "lucide-react";
import { useI18n } from "@/context/i18n";

// While the guide is found or made (the first time for a place it is written and recorded: up to a minute)
const GuideLoading = () => {
  const { texts } = useI18n();
  const words = texts.trips.audioGuide;
  return (
    <div role="status" className="grid justify-items-center gap-2 py-10 text-center">
      <LoaderCircle className="size-7 animate-spin text-muted-foreground motion-reduce:animate-none" />
      <p className="font-heading text-lg font-semibold">{words.preparing}</p>
      <p className="max-w-xs text-sm text-muted-foreground">{words.preparingHint}</p>
    </div>
  );
};

export default GuideLoading;
