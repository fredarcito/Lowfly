"use client";

import { useEffect, useSyncExternalStore } from "react";
import { DEFAULT_THEME, THEME_COLORS, THEME_KEY } from "@/constants/theme";

// The theme lives in <html data-theme>, set before paint by the script in the layout
const subscribe = (onChange) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
};
const getTheme = () => document.documentElement.dataset.theme || DEFAULT_THEME;

// The current theme ("light" | "dark") and changing it (kept in this browser). It also paints the browser's
// and system's bar in the colour of the header.
export const useTheme = () => {
  const theme = useSyncExternalStore(subscribe, getTheme, () => DEFAULT_THEME);

  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
  }, [theme]);

  const setTheme = (chosen) => {
    document.documentElement.dataset.theme = chosen;
    try {
      localStorage.setItem(THEME_KEY, chosen);
    } catch {}
  };

  return { theme, setTheme };
};
