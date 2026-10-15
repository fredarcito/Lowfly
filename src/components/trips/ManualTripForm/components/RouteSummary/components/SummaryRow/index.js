"use client";

import { cn } from "@/utils/cn";

// One line of the trip's summary: a coral icon and its value, fading in when the value changes (`valueKey`)
const SummaryRow = ({ icon: Icon, valueKey, muted = false, children }) => {
  return (
    <li className="flex items-center gap-4">
      <Icon className="size-5 shrink-0 text-primary" />
      <span
        key={valueKey}
        className={cn("min-w-0 font-heading font-bold duration-300 animate-in fade-in motion-reduce:animate-none", muted && "font-sans font-normal text-muted-foreground")}
      >
        {children}
      </span>
    </li>
  );
};

export default SummaryRow;
