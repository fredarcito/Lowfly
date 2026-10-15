"use client";

import { cn } from "@/utils/cn";
import CityLine from "@/components/search/DestinationOption/components/CityLine";
import CountryLine from "@/components/search/DestinationOption/components/CountryLine";

// One option of the destination picker: a whole country or one of its cities
const DestinationOption = ({ id, option, index, active, selected, onPick, onHover }) => (
  <div
    id={id}
    role="option"
    aria-selected={selected}
    data-index={index}
    onClick={onPick}
    onPointerMove={onHover}
    className={cn(
      "my-0.5 flex cursor-pointer items-center gap-3 rounded-md py-2 pr-2.5",
      option.city ? "pl-9" : "pl-2.5",
      active && "bg-accent",
      selected && "text-primary-ink"
    )}
  >
    {option.city ? <CityLine city={option.city} /> : <CountryLine country={option.country} />}
  </div>
);

export default DestinationOption;
