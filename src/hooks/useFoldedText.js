"use client";

import { useEffect, useLayoutEffect, useState } from "react";

// A text folded to a few lines that grows and shrinks smoothly instead of jumping. Its height goes between
// `lines` lines and the whole text (measured once the text is there, again when opened and when the width
// changes); the "…" (`clamped`) only shows once it has finished folding. `style` sets --fold-height for the
// text's height class.
export const useFoldedText = (expanded, lines) => {
  // A callback ref: the text only appears once the guide has loaded
  const [text, textRef] = useState(null);
  const [heights, setHeights] = useState({ folded: null, whole: null });
  const [clamped, setClamped] = useState(!expanded);

  // Opening: no "…" from the start, so the rest of the text shows while it grows
  useLayoutEffect(() => {
    if (expanded) setClamped(false);
  }, [expanded]);

  useEffect(() => {
    if (!text) return;
    const measure = () => {
      const lineHeight = parseFloat(getComputedStyle(text).lineHeight);
      setHeights({ folded: Math.round(lineHeight * lines), whole: text.scrollHeight });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(text.parentElement);
    return () => observer.disconnect();
  }, [text, lines, expanded]);

  const height = expanded ? heights.whole : heights.folded;
  return {
    textRef,
    clamped,
    style: height ? { "--fold-height": `${height}px` } : undefined,
    // Folded again: now the "…"
    onTransitionEnd: (event) => event.propertyName === "height" && !expanded && setClamped(true),
  };
};
