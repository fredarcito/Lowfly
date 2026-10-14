"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { DEFAULT_THEME, THEME_COLORS, THEME_KEY } from "@/constants/theme";

// The theme lives in <html data-theme>, set before paint by the script in the layout
const subscribe = (cb) => {
  const observer = new MutationObserver(cb);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
};
const getTheme = () => document.documentElement.dataset.theme || DEFAULT_THEME;

const ThemeToggle = () => {
  const { t } = useI18n();
  const theme = useSyncExternalStore(subscribe, getTheme, () => DEFAULT_THEME);
  const next = theme === "dark" ? "light" : "dark";

  // Browser / system bar in the colour of the header
  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
  }, [theme]);

  const toggle = () => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={next === "light" ? t.header.toLight : t.header.toDark}
      title={next === "light" ? t.header.toLight : t.header.toDark}
      className="grid size-9 shrink-0 place-items-center rounded-full bg-hero-chip text-hero-muted transition-colors hover:text-hero-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
};

export default ThemeToggle;
