"use client";

import { cn } from "@/utils/cn";

// A destination's highlights: coral pills, or `plain` text joined by dots (over a photo, where pills would
// compete with the title)
const Tags = ({ tags, plain = false, className }) => {
  if (plain) {
    return (
      <ul className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-hero-muted sm:text-base", className)}>
        {tags.map((tag, index) => (
          <li key={tag} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden>·</span>}
            {tag}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className={cn("flex flex-wrap items-start gap-1.5", className)}>
      {tags.map((tag) => (
        <li key={tag} className="rounded-full bg-selected px-2.5 py-0.5 text-xs font-medium text-primary-ink">
          {tag}
        </li>
      ))}
    </ul>
  );
};

export default Tags;
