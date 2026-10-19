"use client";

import { useI18n } from "@/context/i18n";

// A city in the destination picker: its name and airport codes, indented under its country, and whether it is
// reached with a stop only
const CityLine = ({ city }) => {
  const { texts } = useI18n();
  return (
    <>
      <span className="min-w-0 flex-1 truncate">
        {city.name}
        {city.stopover && <span className="ml-2 text-xs text-muted-foreground">{texts.destination.withStop}</span>}
      </span>
      <span className="shrink-0 text-xs font-semibold tracking-widest text-muted-foreground">{city.codes.join(" · ")}</span>
    </>
  );
};

export default CityLine;
