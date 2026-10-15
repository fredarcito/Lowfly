"use client";

import { useEffect, useRef, useState } from "react";

// Whether the page has scrolled past a marker (it left the screen upwards). Put `markerRef` on an empty element
// where the content starts. `watching`: whether the marker is on the page (re-observes when it appears).
export const useScrolledPast = (watching = true) => {
  const markerRef = useRef(null);
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    const observer = new IntersectionObserver(([entry]) => setScrolledPast(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    observer.observe(marker);
    return () => observer.disconnect();
  }, [watching]);

  return { markerRef, scrolledPast };
};
