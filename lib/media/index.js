"use client";

import { useSyncExternalStore } from "react";

// Two-month calendars and popovers only fit from md up; below that pickers are bottom sheets
const DESKTOP = "(min-width: 768px)";

const subscribe = (cb) => {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export const useDesktop = () => useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP).matches, () => true);
