"use client";

import Link from "next/link";
import { Cloud } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

// Signed out with trips saved: they only live in this browser. A quiet note that says so, with signing in (which
// adds them to the account) as a coral link. `inline`: one small line, under the page's title (bigger screens);
// otherwise two lines (phones).
const LocalTripsNotice = ({ inline = false, className }) => {
  const { lang, texts } = useI18n();
  return (
    <div className={cn("flex items-center duration-300 animate-in fade-in motion-reduce:animate-none", inline ? "gap-2 text-sm" : "gap-4 px-1 text-sm", className)}>
      <Cloud className={cn("shrink-0 text-muted-foreground", inline ? "size-4" : "size-6")} strokeWidth={1.75} />
      <p className={cn(inline ? "flex flex-wrap items-baseline gap-x-1.5" : "grid gap-0.5")}>
        <span className="text-muted-foreground">{texts.trips.localOnly}</span>
        {inline && (
          <span aria-hidden className="text-muted-foreground">
            ·
          </span>
        )}
        <Link
          href={ROUTES.login(lang, ROUTES.trips(lang))}
          className="w-fit rounded-sm font-medium text-primary-ink underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {texts.trips.localOnlyHint}
        </Link>
      </p>
    </div>
  );
};

export default LocalTripsNotice;
