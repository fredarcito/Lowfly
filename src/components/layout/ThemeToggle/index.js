"use client";

import { Moon, Sun } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/utils/cn";

// Light / dark in one round button on the header (useTheme)
const ThemeToggle = ({ className }) => {
  const { texts } = useI18n();
  const { theme, setTheme } = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  const label = next === "light" ? texts.header.toLight : texts.header.toDark;

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full md:size-10 bg-hero-glass text-hero-foreground/85 ring-1 ring-hero-glass-edge backdrop-blur-md transition-colors hover:text-hero-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        className
      )}
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
};

export default ThemeToggle;
