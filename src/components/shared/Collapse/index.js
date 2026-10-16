"use client";

import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";

// Longest the height animation takes (it is 300 ms): past it the fold counts as settled even if the browser sent no
// transitionend (reduced motion turns the transition off)
const SETTLE_MS = 400;

// Animates its height between 0 and auto (grid rows 0fr ↔ 1fr). While closed the content is inert, and once
// closed it is left out of the page (display: none): folded away it would still add to the page's height (a long
// list of closed results left an empty stretch under it). Overflow is only clipped while closed or animating, so
// focus rings are not cut off once open.
const Collapse = ({ open, className, children }) => {
  // Not moving: fully open or fully closed
  const [settled, setSettled] = useState(true);
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    setSettled(false);
  }

  useEffect(() => {
    if (settled) return;
    const timer = setTimeout(() => setSettled(true), SETTLE_MS);
    return () => clearTimeout(timer);
  }, [settled]);

  return (
    <div
      inert={!open}
      onTransitionEnd={(event) => event.target === event.currentTarget && event.propertyName === "grid-template-rows" && setSettled(true)}
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        className
      )}
    >
      <div className={cn("min-h-0 min-w-0", !(open && settled) && "overflow-hidden", !open && settled && "hidden")}>{children}</div>
    </div>
  );
};

export default Collapse;
