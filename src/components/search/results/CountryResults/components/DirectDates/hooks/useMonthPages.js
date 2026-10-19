"use client";

import { useState } from "react";
import { useDesktop } from "@/hooks/useDesktop";

// The months of the price calendar shown at once: two on desktop, one on phones, moved with arrows. It opens on the
// month of the best day (on desktop, with the month after it, or before it when it is the last one).
// { shown, paged, canBack, canForward, back(), forward() }
export const useMonthPages = (months, bestDay) => {
  const perPage = useDesktop() ? 2 : 1;
  const [chosen, setChosen] = useState(null);
  const lastStart = Math.max(0, months.length - perPage);
  const bestMonth = Math.max(0, months.findIndex((month) => bestDay?.startsWith(month.slice(0, 7))));
  const start = Math.min(chosen ?? bestMonth, lastStart);
  return {
    shown: months.slice(start, start + perPage),
    paged: months.length > perPage,
    canBack: start > 0,
    canForward: start < lastStart,
    back: () => setChosen(start - 1),
    forward: () => setChosen(start + 1),
  };
};
