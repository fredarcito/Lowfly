"use client";

import { useState } from "react";
import FoldToggle from "@/components/shared/FoldToggle";
import { useFoldedText } from "@/hooks/useFoldedText";
import { cn } from "@/utils/cn";

// How many lines of its text a card shows on phones before "See more"
const FOLDED_LINES = 2;

// One card of what to know (a guide's "Where to stay", a route's "When to go"): on phones its text folds to a few lines with
// "See more ⌄" (it grows smoothly, as a shared trip's destination text), so the days come sooner; from tablets up,
// all of it. The whole text is in the page either way (search engines read it).
const IntroCard = ({ icon: Icon, title, text, className, style }) => {
  const [expanded, setExpanded] = useState(false);
  const folded = useFoldedText(expanded, FOLDED_LINES);
  return (
    <div className={cn("grid content-start gap-1.5 rounded-xl bg-card p-5 ring-1 ring-foreground/10", className)} style={style}>
      <h2 className="flex items-center gap-2 font-heading font-bold">
        <Icon className="size-4.5 text-primary" /> {title}
      </h2>
      <p
        ref={folded.textRef}
        style={folded.style}
        onTransitionEnd={folded.onTransitionEnd}
        className={cn(
          "text-sm leading-relaxed text-muted-foreground",
          "max-sm:h-(--fold-height) max-sm:overflow-hidden max-sm:transition-[height] max-sm:duration-300 max-sm:ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none",
          folded.clamped && "max-sm:line-clamp-2"
        )}
      >
        {text}
      </p>
      <FoldToggle expanded={expanded} onToggle={() => setExpanded((current) => !current)} />
    </div>
  );
};

export default IntroCard;
