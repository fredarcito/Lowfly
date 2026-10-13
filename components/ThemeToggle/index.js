"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";
import { DEFAULT_THEME, THEME_KEY } from "@/lib/theme";

// The theme lives in <html data-theme>, set before paint by the script in the layout
const subscribe = (cb) => {
  const observer = new MutationObserver(cb);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
};
const getTheme = () => document.documentElement.dataset.theme || DEFAULT_THEME;

export default function ThemeToggle() {
  const { t } = useI18n();
  const theme = useSyncExternalStore(subscribe, getTheme, () => DEFAULT_THEME);
  const next = theme === "dark" ? "light" : "dark";

  function toggle() {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
  }

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
}
