"use client";

import { BookOpen, ChevronDown } from "lucide-react";
import Collapse from "@/components/shared/Collapse";
import { useI18n } from "@/context/i18n";
import { useDisclosure } from "@/hooks/useDisclosure";
import { cn } from "@/utils/cn";

// History and curiosities, folded; only with sources (the AI must back what it says)
const StopHistory = ({ history, sources }) => {
  const { texts } = useI18n();
  const section = useDisclosure();
  if (!history || !sources?.length) return null;
  return (
    <div className="rounded-lg ring-1 ring-foreground/10">
      <button
        type="button"
        onClick={section.toggle}
        aria-expanded={section.open}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium"
      >
        <BookOpen className="size-4 text-muted-foreground" />
        <span className="flex-1">{texts.trips.history}</span>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", section.open && "rotate-180")} />
      </button>
      <Collapse open={section.open}>
        <div className="grid gap-2 px-3 pb-3 text-sm">
          <p>{history}</p>
          <p className="text-xs text-muted-foreground">
            {texts.trips.sources}:{" "}
            {sources.map((source, index) => (
              <span key={source.url}>
                {index > 0 && " · "}
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                  {source.title}
                </a>
              </span>
            ))}
          </p>
        </div>
      </Collapse>
    </div>
  );
};

export default StopHistory;
