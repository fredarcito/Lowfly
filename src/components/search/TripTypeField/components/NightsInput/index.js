"use client";

import { Input } from "@/components/ui/input";

const MAX_NIGHTS = 30;

// One of the two ends of the stay ("from 2 to 4 nights")
const NightsInput = ({ label, value, onChange }) => (
  <Input
    type="number"
    min="1"
    max={MAX_NIGHTS}
    inputMode="numeric"
    aria-label={label}
    className="h-9 w-14 text-center"
    value={value}
    onChange={(event) => onChange(event.target.value)}
  />
);

export default NightsInput;
