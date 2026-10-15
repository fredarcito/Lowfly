"use client";

import { useEffect, useRef } from "react";

// A town just added with "Add another town": bring its card into view (smoothly, unless the visitor prefers
// less motion) and put the cursor in its town search, ready to type. `cardRef` goes on the card.
export const useFocusWhenAdded = (justAdded) => {
  const cardRef = useRef(null);
  useEffect(() => {
    const card = cardRef.current;
    if (!justAdded || !card) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    card.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
    // Without scrolling again: the smooth scroll above takes it there
    card.querySelector("input[role=combobox]")?.focus({ preventScroll: true });
    // Only when it arrives
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return cardRef;
};
