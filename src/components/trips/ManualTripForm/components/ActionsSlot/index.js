"use client";

// Where the step's actions go, in the summary (desktop) and the bottom bar (phones): a fixed height (a row of
// buttons and a line of small text), so changing steps only swaps what is inside and nothing moves
const ActionsSlot = ({ children }) => <div className="grid h-[4.75rem] grid-rows-[3rem_1.25rem] gap-2">{children}</div>;

export default ActionsSlot;
