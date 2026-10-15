"use client";

import { ChevronDown } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { cn } from "@/utils/cn";

// "See more ⌄" / "See less ⌃" next to a folded text, in coral (phones only)
const FoldToggle = ({ expanded, onToggle }) => {
  const { texts } = useI18n();
  return (
    <button
      type="button"
      aria-expanded={expanded}
      onClick={onToggle}
      className="flex shrink-0 items-center gap-1 rounded-md text-sm font-semibold text-primary-ink outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:hidden"
    >
      {expanded ? texts.results.seeLess : texts.results.seeMore}
      <ChevronDown className={cn("size-4 transition-transform", expanded && "rotate-180")} />
    </button>
  );
};

export default FoldToggle;
