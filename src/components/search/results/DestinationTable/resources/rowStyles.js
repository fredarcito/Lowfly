// Same columns for the header and every row.
// Phone and tablet: destination and price on top, dates and stay below. Desktop: one column each.
export const ROW_GRID =
  "grid grid-cols-[minmax(0,1fr)_auto_1rem] items-center gap-x-4 gap-y-2 px-4 py-3 [grid-template-areas:'dest_price_go''when_when_when'] sm:px-5 " +
  "lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.3fr)_9rem_9.5rem_1rem] lg:[grid-template-areas:'dest_dates_stay_price_go']";

// A row is a button that opens its details (flights, booking, save) below it
export const ROW_BUTTON =
  "w-full text-left transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none aria-expanded:bg-muted/40";
