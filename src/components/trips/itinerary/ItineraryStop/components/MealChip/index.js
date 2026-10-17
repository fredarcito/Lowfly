"use client";

import { ChevronDown, Utensils } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { cn } from "@/utils/cn";

// A meal's way in to what to try and where: opens and closes it (its title does too), its arrow saying which
const MealChip = ({ open, onClick }) => {
  const { texts } = useI18n();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className="flex w-fit items-center gap-2 rounded-full border border-foreground/15 px-3.5 py-1.5 text-sm font-medium transition-colors outline-none hover:bg-foreground/[0.06] focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Utensils className="size-4 text-sun-ink" /> {texts.trips.mealChip} <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
    </button>
  );
};

export default MealChip;
