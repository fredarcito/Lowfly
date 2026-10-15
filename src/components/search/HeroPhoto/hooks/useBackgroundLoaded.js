"use client";

import { useEffect, useRef, useState } from "react";

// Whether an element's CSS background photo has loaded, so it can fade in instead of popping up. The photo
// depends on the theme and the screen (Positano by day or at dusk, small or large), so it is read from the
// element itself. `ref` goes on the element.
export const useBackgroundLoaded = () => {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const element = ref.current;
    const address = element && getComputedStyle(element).backgroundImage.match(/url\("?(.+?)"?\)/)?.[1];
    // Nothing to wait for: show it
    if (!address) return setLoaded(true);
    let live = true;
    const image = new Image();
    // From the next frame, so a photo already in the browser's cache fades in too
    const reveal = () => requestAnimationFrame(() => live && setLoaded(true));
    image.onload = reveal;
    image.onerror = reveal;
    image.src = address;
    return () => {
      live = false;
    };
  }, []);

  return { ref, loaded };
};
