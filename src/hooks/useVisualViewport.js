"use client";

import { useEffect, useState } from "react";

// The part of the screen the visitor sees, which the on-screen keyboard shrinks (phones). `bottom`: how much of
// the page's bottom the keyboard covers, in px; `height`: what is left above it. Fixed things placed with them
// sit just above the keyboard (iOS keeps them at the page's bottom, under the keyboard). Both null without a
// keyboard or where the browser cannot tell.
const SMALLEST_KEYBOARD = 120;

export const useVisualViewport = () => {
  const [view, setView] = useState({ bottom: null, height: null });

  useEffect(() => {
    const visual = window.visualViewport;
    if (!visual) return;
    const measure = () => {
      const bottom = Math.max(0, window.innerHeight - visual.height - visual.offsetTop);
      setView(bottom > SMALLEST_KEYBOARD ? { bottom, height: visual.height } : { bottom: null, height: null });
    };
    measure();
    visual.addEventListener("resize", measure);
    visual.addEventListener("scroll", measure);
    return () => {
      visual.removeEventListener("resize", measure);
      visual.removeEventListener("scroll", measure);
    };
  }, []);

  return view;
};
