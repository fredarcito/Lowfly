"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Which sides of a row that scrolls sideways have more hidden: the left once scrolled, the right until its end.
// Checked on scroll and when the row or its content change size (the aside sliding in narrows it).
export const useHiddenSides = () => {
  const rowRef = useRef(null);
  const [hidden, setHidden] = useState({ left: false, right: false });

  const check = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    const left = row.scrollLeft > 1;
    const right = row.scrollLeft + row.clientWidth < row.scrollWidth - 1;
    setHidden((previous) => (previous.left === left && previous.right === right ? previous : { left, right }));
  }, []);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    check();
    const observer = new ResizeObserver(check);
    observer.observe(row);
    [...row.children].forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [check]);

  return { rowRef, hidden, onScroll: check };
};
