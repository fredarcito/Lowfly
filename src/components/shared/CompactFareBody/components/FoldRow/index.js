"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Collapse from "@/components/shared/Collapse";
import { cn } from "@/utils/cn";

// A row that unfolds what is under it (a flight, the baggage)
const FoldRow = ({ icon: Icon, summary, children, className }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("border-t", className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center gap-3 py-3.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Icon className="size-5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1">{summary}</span>
        <ChevronDown className={cn("size-5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      <Collapse open={open}>
        <div className="pb-4">{children}</div>
      </Collapse>
    </div>
  );
};

export default FoldRow;
