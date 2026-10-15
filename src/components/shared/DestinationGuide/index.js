"use client";

import { useState } from "react";
import { useI18n } from "@/context/i18n";
import { useDestinationGuide } from "@/components/shared/DestinationGuide/hooks/useDestinationGuide";
import { cn } from "@/utils/cn";
import Tags from "@/components/shared/DestinationGuide/components/Tags";

// Why a destination is worth a visit: a sentence and three highlights, with its source.
// `tagsOnly` for small spaces (weekend cards); `textClassName` restyles the sentence (a trip's photo header);
// `collapsible` (a compact card on phones): three lines and "See more", which shows the rest, the source and
// the highlights. Shows nothing while loading or when there is no guide.
const DestinationGuide = ({ code, tagsOnly = false, collapsible = false, className, textClassName }) => {
  const { texts } = useI18n();
  const guide = useDestinationGuide(code);
  const [expanded, setExpanded] = useState(false);
  if (!guide) return null;
  if (tagsOnly) return <Tags tags={guide.tags} className={className} />;
  const folded = collapsible && !expanded;
  return (
    <div className={cn("grid gap-3 pb-3 duration-300 animate-in fade-in motion-reduce:animate-none", className)}>
      <p className={cn("text-[0.875rem] leading-relaxed sm:text-[0.875rem]", folded && "line-clamp-3", textClassName)}>
        {guide.text}{" "}
        {!folded && (
          <a href={guide.source} target="_blank" rel="noopener noreferrer" className="text-xs whitespace-nowrap text-muted-foreground underline hover:text-foreground">
            {texts.results.guideSource}
          </a>
        )}
      </p>
      {!folded && <Tags tags={guide.tags} />}
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
