"use client";

import { ChevronDown } from "lucide-react";
import Collapse from "@/components/shared/Collapse";
import { useDisclosure } from "@/hooks/useDisclosure";
import { cn } from "@/utils/cn";

// One fold of the account's page: its icon, title and a short summary on the right (what matters, without opening
// it); a tap unfolds the rest. `icon`: an element (<Plane />; a server page cannot hand over the component itself).
// `danger` paints it red (deleting the account).
const Section = ({ id, icon, title, summary, defaultOpen = false, danger = false, children }) => {
  const fold = useDisclosure(defaultOpen);
  return (
    <section>
      <h2>
        <button
          type="button"
          onClick={fold.toggle}
          aria-expanded={fold.open}
          aria-controls={`${id}-body`}
          className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors outline-none hover:bg-muted/40 focus-visible:bg-muted/40"
        >
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-lg [&>svg]:size-4.5",
              danger ? "bg-destructive/10 text-destructive" : "bg-selected text-primary-ink"
            )}
          >
            {icon}
          </span>
          {/* Phones: the summary under the title; wider, on the right */}
          <span className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:gap-3">
            <span className={cn("min-w-0 flex-1 font-heading text-base font-bold", danger && "text-destructive")}>{title}</span>
            {summary && <span className="truncate text-sm text-muted-foreground max-sm:text-xs">{summary}</span>}
          </span>
          <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-300", fold.open && "rotate-180")} />
        </button>
      </h2>
      <Collapse open={fold.open}>
        <div id={`${id}-body`} className="px-5 pt-1 pb-5 sm:pl-[4.25rem]">
          {children}
        </div>
      </Collapse>
    </section>
  );
};

export default Section;
