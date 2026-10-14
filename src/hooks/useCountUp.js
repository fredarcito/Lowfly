"use client";

import { useEffect, useState } from "react";

// Counts up to `value` when it appears (skipped with reduced motion)
export function useCountUp(value, duration = 700) {
  const [shown, setShown] = useState(value * 0.4);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setShown(value);
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      // Ends on the exact value (the eased product can land a cent below it)
      setShown(progress < 1 ? value * (0.4 + 0.6 * (1 - (1 - progress) ** 3)) : value);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);
  return shown;
}
