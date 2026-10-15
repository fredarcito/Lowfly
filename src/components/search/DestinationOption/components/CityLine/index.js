"use client";



// A city in the destination picker: its name and airport codes, indented under its country
const CityLine = ({ city }) => (
  <>
    <span className="min-w-0 flex-1 truncate">{city.name}</span>
    <span className="shrink-0 text-xs font-semibold tracking-widest text-muted-foreground">{city.codes.join(" · ")}</span>
  </>
);

export default CityLine;
