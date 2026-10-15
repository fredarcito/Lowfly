// The trip's figures on a glass card. Phones: the whole width, a 2×2 grid with lines between the figures.
// Tablet and up: as wide as the figures, in one row (TripStats' own dividers).
export const STATS_CARD =
  "mt-2 rounded-xl bg-card/70 ring-1 ring-foreground/10 backdrop-blur-md md:w-fit md:px-5 md:py-3 " +
  "max-md:gap-0 max-md:overflow-hidden max-md:*:px-4 max-md:*:py-3 " +
  "max-md:[&>*:nth-child(odd)]:border-r max-md:[&>*:nth-child(-n+2)]:border-b";
