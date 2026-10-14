"use client";

import { useEffect, useState } from "react";

// false on the server and in the first render, true once in the browser.
// For content that only exists on this device (localStorage), so the page does not flash an empty state.
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
