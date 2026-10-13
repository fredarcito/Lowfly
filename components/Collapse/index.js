"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// Animates its height between 0 and auto (grid rows 0fr ↔ 1fr). While closed the content is inert.
// Overflow is only clipped while closed or animating, so focus rings are not cut off once open.
export default function Collapse({ open, className, children }) {
  const [settled, setSettled] = useState(open);
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    setSettled(false);
  }

  return (
    <div
      inert={!open}
      onTransitionEnd={(e) => e.target === e.currentTarget && e.propertyName === "grid-template-rows" && setSettled(open)}
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        className
      )}
    >
      <div className={cn("min-h-0 min-w-0", !(open && settled) && "overflow-hidden")}>{children}</div>
    </div>
  );
}
