"use client";

import { MODES } from "@/components/search/ModeTabs";
import { useI18n } from "@/context/i18n";
import { cn } from "@/utils/cn";

// What each search mode does, the selected one highlighted
const SearchModes = ({ mode }) => {
  const { texts } = useI18n();
  return (
    <section className="grid gap-4">
      <h2 className="font-heading text-xl font-bold tracking-tight">{texts.empty.title}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MODES.map(({ id, icon: Icon }) => (
          <div
            key={id}
            className={cn(
              "grid content-start gap-2 rounded-xl p-4 ring-1 ring-foreground/10 transition-colors",
              id === mode ? "bg-card ring-2 ring-primary/50" : "bg-transparent opacity-70"
            )}
          >
            <Icon className={cn("size-5", id === mode ? "text-primary" : "text-muted-foreground")} />
            <p className="font-heading font-semibold">{texts.modes[id].label}</p>
            <p className="text-sm text-muted-foreground">{texts.modes[id].hint}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SearchModes;
