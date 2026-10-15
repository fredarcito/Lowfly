"use client";

import { useState } from "react";
import { PlaneTakeoff } from "lucide-react";
import { Button } from "@/components/ui/button";
import AirportPicker from "@/components/search/AirportPicker";
import ListPickerPopover from "@/components/shared/ListPickerPopover";
import { useI18n } from "@/context/i18n";
import { findAirport } from "@/hooks/useAirports";

// Departure airport: a button that opens a searchable list (popover on desktop, bottom sheet on mobile)
const AirportField = ({ id, value, airports, onChange }) => {
  const { texts } = useI18n();
  const [open, setOpen] = useState(false);
  const current = findAirport(airports, value);

  const pick = (code) => {
    onChange(code);
    setOpen(false);
  };

  const trigger = (
    <Button id={id} variant="outline" className="h-11 w-full justify-start gap-2 px-3 text-left text-base font-normal md:text-sm">
      <PlaneTakeoff className="text-muted-foreground" />
      {value ? (
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate">{current?.name ?? value}</span>
          <span className="ml-auto shrink-0 text-xs font-semibold tracking-widest text-muted-foreground">{value}</span>
        </span>
      ) : (
        <span className="text-muted-foreground">{texts.airport.choose}</span>
      )}
    </Button>
  );

  return (
    <ListPickerPopover open={open} onOpenChange={setOpen} trigger={trigger} title={texts.airport.title} description={texts.airport.search}>
      <AirportPicker airports={airports} value={value} onPick={pick} />
    </ListPickerPopover>
  );
};

export default AirportField;
