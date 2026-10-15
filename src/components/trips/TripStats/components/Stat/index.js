"use client";

import { cn } from "@/utils/cn";

// One figure: label above, value below
const Stat = ({ label, icon: Icon, strong, children }) => {
  return (
    <div className="grid gap-0.5 md:px-4 md:first:pl-0 lg:px-5">
      <dt className="text-xs whitespace-nowrap text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "flex items-center gap-1.5 font-medium whitespace-nowrap first-letter:uppercase",
          strong && "font-heading text-lg font-extrabold tabular-nums"
        )}
      >
        {Icon && <Icon className="size-4 text-muted-foreground" />}
        {children}
      </dd>
    </div>
  );
};

export default Stat;
