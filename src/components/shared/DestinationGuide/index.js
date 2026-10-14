"use client";

import { useI18n } from "@/context/i18n";
import { useDestinationGuide } from "@/hooks/useDestinationGuide";
import { cn } from "@/utils/cn";

function Tags({ tags, className }) {
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {tags.map((tag) => (
        <li key={tag} className="rounded-full bg-selected px-2.5 py-0.5 text-xs font-medium text-primary-ink">
          {tag}
        </li>
      ))}
    </ul>
  );
}

// Why a destination is worth a visit: a sentence and three highlights, with its source.
// `tagsOnly` for small spaces (weekend cards); `textClassName` restyles the sentence (a trip's photo header).
// Shows nothing while loading or when there is no guide.
export default function DestinationGuide({ code, tagsOnly = false, className, textClassName }) {
  const { t } = useI18n();
  const guide = useDestinationGuide(code);
  if (!guide) return null;
  if (tagsOnly) return <Tags tags={guide.tags} className={className} />;
  return (
    <div className={cn("grid gap-3 pb-3 duration-300 animate-in fade-in motion-reduce:animate-none", className)}>
      <p className={cn("text-[0.875rem] leading-relaxed sm:text-[0.875rem]", textClassName)}>
        {guide.text}{" "}
        <a href={guide.source} target="_blank" rel="noopener noreferrer" className="text-xs whitespace-nowrap text-muted-foreground underline hover:text-foreground">
          {t.results.guideSource}
        </a>
      </p>
      <Tags tags={guide.tags} />
    </div>
  );
}
