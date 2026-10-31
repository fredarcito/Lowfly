"use client";

import { useState } from "react";

// The highlighted result of a search list (the arrows move it, the pointer too): back to the first one whenever new
// results arrive. Kept with the results it belongs to, so it never points into an older list. [active, setActive],
// like useState (setActive also takes a function of the current one).
export const useHighlighted = (list) => {
  const [highlighted, setHighlighted] = useState({ list, index: 0 });
  const active = highlighted.list === list ? highlighted.index : 0;
  const setActive = (change) =>
    setHighlighted((current) => {
      const index = current.list === list ? current.index : 0;
      return { list, index: typeof change === "function" ? change(index) : change };
    });
  return [active, setActive];
};
