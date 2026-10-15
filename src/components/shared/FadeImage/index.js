"use client";

import { useState } from "react";
import { cn } from "@/utils/cn";

// A header's photo that fades in once it has loaded (the trip's header), instead of popping up line by line; one already in the browser's
// cache fades in too, from the next frame. Any <img> props; `className` may add its own transforms (they share
// the transition).
const FadeImage = ({ className, onLoad, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const reveal = (event) => {
    setLoaded(true);
    onLoad?.(event);
  };
  return (
    <img
      // Complete before React listened (cached): start the fade on the next frame
      ref={(image) => {
        if (image?.complete && image.naturalWidth && !loaded) requestAnimationFrame(() => setLoaded(true));
      }}
      onLoad={reveal}
      className={cn("transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none", loaded ? "opacity-100" : "opacity-0", className)}
      {...props}
    />
  );
};

export default FadeImage;
