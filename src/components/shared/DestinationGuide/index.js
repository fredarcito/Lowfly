"use client";

import { useState } from "react";
import { useI18n } from "@/context/i18n";
import { useDestinationGuide } from "@/components/shared/DestinationGuide/hooks/useDestinationGuide";
import { cn } from "@/utils/cn";
import { useFoldedText } from "@/hooks/useFoldedText";
import FoldToggle from "@/components/shared/FoldToggle";
import Tags from "@/components/shared/DestinationGuide/components/Tags";

// Why a destination is worth a visit: a sentence and three highlights, with its source.
// `tagsOnly` for small spaces (weekend cards); `textClassName` restyles the sentence (a trip's photo header);
// `collapsible` (a compact card on phones): three lines and "See more", which shows the rest, the source and
// the highlights. `foldOnPhones` (a shared trip's header): on phones only, two lines with "See more ⌄" beside
// them; bigger screens show it whole. `plainTags` (a trip's photo header): the highlights as text, "A · B · C".
// Shows nothing while loading or when there is no guide.
const DestinationGuide = ({ code, tagsOnly = false, collapsible = false, foldOnPhones = false, plainTags = false, className, textClassName }) => {
  const { texts } = useI18n();
  const guide = useDestinationGuide(code);
  const [expanded, setExpanded] = useState(false);
  const foldedText = useFoldedText(expanded, 2);
  if (!guide) return null;
  if (tagsOnly) return <Tags tags={guide.tags} className={className} />;
  const folded = collapsible && !expanded;
  const foldedOnPhones = foldOnPhones && !expanded;
  const toggle = () => setExpanded((current) => !current);
  return (
    <div className={cn("grid content-start gap-3 pb-3 duration-300 animate-in fade-in motion-reduce:animate-none", className)}>
      <div className="flex items-end gap-3">
        <p
          ref={foldOnPhones ? foldedText.textRef : undefined}
          style={foldOnPhones ? foldedText.style : undefined}
          onTransitionEnd={foldOnPhones ? foldedText.onTransitionEnd : undefined}
          className={cn(
            "min-w-0 flex-1 text-[0.875rem] leading-relaxed sm:text-[0.875rem]",
            folded && "line-clamp-3",
            foldOnPhones && "max-sm:h-(--fold-height) max-sm:overflow-hidden max-sm:transition-[height] max-sm:duration-300 max-sm:ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none",
            foldOnPhones && foldedText.clamped && "max-sm:line-clamp-2",
            textClassName
          )}
        >
          {guide.text}{" "}
          {!folded && (
            <a
              href={guide.source}
              target="_blank"
              rel="noopener noreferrer"
              className={cn("text-xs whitespace-nowrap text-muted-foreground underline hover:text-foreground", foldedOnPhones && "max-sm:hidden")}
            >
              {texts.results.guideSource}
            </a>
          )}
        </p>
        {/* Folded: "See more" beside the two lines; open, "See less" goes under the highlights */}
        {foldedOnPhones && <FoldToggle expanded={false} onToggle={toggle} />}
      </div>
      {!folded && (
        <Tags
          tags={guide.tags}
          plain={plainTags}
          className={cn(foldedOnPhones && "max-sm:hidden", foldOnPhones && expanded && "duration-500 animate-in fade-in slide-in-from-top-1 motion-reduce:animate-none sm:animate-none")}
        />
      )}
      {foldOnPhones && expanded && <FoldToggle expanded onToggle={toggle} />}
      {collapsible && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
          className="w-fit text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          {expanded ? texts.results.seeLess : texts.results.seeMore}
        </button>
      )}
    </div>
  );
};

export default DestinationGuide;
