"use client";

import { useEffect, useState } from "react";

// An index that moves to the next of `count` every `intervalMs`, back to 0 after the last (rotating texts)
export const useCycle = (count, intervalMs) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((current) => (current + 1) % count), intervalMs);
    return () => clearInterval(timer);
  }, [count, intervalMs]);
  return index;
};
