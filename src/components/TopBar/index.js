"use client";

import { Plane } from "lucide-react";
import LanguageSwitch from "@/components/LanguageSwitch";
import ThemeToggle from "@/components/ThemeToggle";
import TripsLink from "@/components/TripsLink";
import { useI18n } from "@/context/i18n";
import { APP_NAME } from "@/i18n/config";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

// Logo (home), My trips, theme and language. Sits on the header colours (--hero-*).
export default function TopBar({ className }) {
  const { lang } = useI18n();
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <a href={ROUTES.home(lang)} className="flex items-center gap-2 font-heading text-xl font-extrabold tracking-tight">
        <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Plane className="size-4 -rotate-45" />
        </span>
        {APP_NAME}
      </a>
      <div className="flex items-center gap-2">
        <TripsLink />
        <ThemeToggle />
        <LanguageSwitch />
      </div>
    </div>
  );
}
