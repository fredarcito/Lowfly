"use client";

import { useEffect, useState } from "react";

// false until `delay` milliseconds after the first render, then true
export const useDelayPassed = (delay) => {
  const [passed, setPassed] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setPassed(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return passed;
};
