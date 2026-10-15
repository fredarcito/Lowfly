"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

const Chevron = ({ open }) => {
  return <ChevronDown className={cn("size-4 text-muted-foreground transition-transform [grid-area:go]", open && "rotate-180")} />;
};

export default Chevron;
