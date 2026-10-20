"use client";

import Link from "next/link";
import { MODES } from "@/components/search/ModeTabs";
import { useI18n } from "@/context/i18n";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

// What each search mode does, the selected one highlighted, each a link to its own page
const SearchModes = ({ mode }) => {
  const { lang, texts } = useI18n();
  return (
    <section className="grid gap-4">
      <h2 className="font-heading text-xl font-bold tracking-tight">{texts.empty.title}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MODES.map(({ id, icon: Icon }) => (
          <Link
            key={id}
            href={ROUTES.search(lang, id)}
            scroll={false}
            aria-current={id === mode ? "page" : undefined}
            className={cn(
              "grid content-start gap-2 rounded-xl p-4 ring-1 ring-foreground/10 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              id === mode ? "bg-card ring-2 ring-primary/50" : "bg-transparent opacity-70 hover:opacity-100"
            )}
          >
            <Icon className={cn("size-5", id === mode ? "text-primary" : "text-muted-foreground")} />
            <p className="font-heading font-semibold">{texts.modes[id].label}</p>
            <p className="text-sm text-muted-foreground">{texts.modes[id].hint}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default SearchModes;
