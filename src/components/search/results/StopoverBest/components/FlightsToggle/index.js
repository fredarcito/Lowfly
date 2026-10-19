"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/i18n";
import { cn } from "@/utils/cn";

// Shows or folds away the trip's flights (`flights`: useDisclosure): the card's main button, as each flight is bought
// from there
const FlightsToggle = ({ flights, count, className }) => {
  const { texts } = useI18n();
  return (
    <Button size="lg" onClick={flights.toggle} aria-expanded={flights.open} className={cn("h-11 w-full text-base font-bold", className)}>
      {flights.open ? texts.results.hideFlights(count) : texts.results.showFlights(count)}
      <ChevronDown className={cn("transition-transform", flights.open && "rotate-180")} />
    </Button>
  );
};

export default FlightsToggle;
