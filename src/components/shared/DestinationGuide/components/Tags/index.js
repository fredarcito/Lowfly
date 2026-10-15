"use client";

import { cn } from "@/utils/cn";

const Tags = ({ tags, className }) => {
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {tags.map((tag) => (
        <li key={tag} className="rounded-full bg-selected px-2.5 py-0.5 text-xs font-medium text-primary-ink">
          {tag}
        </li>
      ))}
    </ul>
  );
};

export default Tags;
