"use client";

import { AlignLeft } from "lucide-react";
import Collapse from "@/components/shared/Collapse";
import { useI18n } from "@/context/i18n";
import { useDisclosure } from "@/hooks/useDisclosure";

// The words of the step, to read them when it is too loud to hear (or to read along)
const GuideTranscript = ({ text }) => {
  const { texts } = useI18n();
  const words = texts.trips.audioGuide;
  const section = useDisclosure();
  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={section.toggle}
        aria-expanded={section.open}
        className="flex min-h-11 items-center gap-2 justify-self-start text-sm font-semibold"
      >
        <AlignLeft className="size-4" /> {section.open ? words.hideText : words.showText}
      </button>
      <Collapse open={section.open}>
        <p className="text-base leading-relaxed">{text}</p>
      </Collapse>
    </div>
  );
};

export default GuideTranscript;
