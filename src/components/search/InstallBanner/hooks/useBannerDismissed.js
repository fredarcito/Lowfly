"use client";

import { useSyncExternalStore } from "react";

const DISMISSED_KEY = "lowfly.installBannerDismissed";
const listeners = new Set();
// Closed in this page load: holds when the browser keeps nothing (private mode, blocked storage)
let dismissedHere = false;

const subscribe = (onChange) => {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
};

const getDismissed = () => {
  if (dismissedHere) return true;
  try {
    return localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
};

// Whether the visitor closed the install banner (kept in this browser, so it does not come back) and closing it.
// Dismissed on the server: nothing to show until the browser says otherwise.
export const useBannerDismissed = () => {
  const dismissed = useSyncExternalStore(subscribe, getDismissed, () => true);

  const dismiss = () => {
    dismissedHere = true;
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {}
    listeners.forEach((listener) => listener());
  };

  return { dismissed, dismiss };
};
