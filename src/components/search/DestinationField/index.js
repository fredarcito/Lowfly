"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import DestinationPicker from "@/components/search/DestinationPicker";
import ListPickerPopover from "@/components/shared/ListPickerPopover";
import { useI18n } from "@/context/i18n";
import { flag } from "@/utils/format";

// Destination: a whole country or one of its cities. A button that opens a searchable list
// (popover on desktop, bottom sheet on mobile). value: { country, city } (city "" = the whole country)
const DestinationField = ({ id, value, countries, onChange }) => {
  const { texts } = useI18n();
  const [open, setOpen] = useState(false);
  const country = countries.list.find((candidate) => candidate.name === value.country);
  const placeholder = { loading: texts.form.countryLoading, error: texts.form.countryError }[countries.status] || texts.form.countryChoose;

  const pick = (destination) => {
    onChange(destination);
    setOpen(false);
  };

  const trigger = (
    <Button
      id={id}
      variant="outline"
      disabled={countries.status !== "ok"}
      className="h-11 w-full justify-start gap-2 px-3 text-left text-base font-normal md:text-sm"
    >
      {country ? <span className="text-base leading-none">{flag(country.countryCode)}</span> : <MapPin className="text-muted-foreground" />}
      {value.country ? (
        <span className="min-w-0 flex-1 truncate">{value.city ? `${value.city}, ${value.country}` : value.country}</span>
      ) : (
        <span className="text-muted-foreground">{placeholder}</span>
      )}
    </Button>
  );

  return (
    <ListPickerPopover open={open} onOpenChange={setOpen} trigger={trigger} title={texts.destination.title} description={texts.destination.search}>
      <DestinationPicker countries={countries} value={value} onPick={pick} />
    </ListPickerPopover>
  );
};

export default DestinationField;
