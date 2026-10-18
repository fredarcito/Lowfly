"use client";

import { useEffect, useState } from "react";

// Which of the guide's days is being read: the last one whose section has reached the top third of the screen
// (`ids`: the sections', in order). The first one before any.
export const useActiveDay = (ids) => {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join(",");
  useEffect(() => {
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const update = () => {
      const reached = sections.filter((section) => section.getBoundingClientRect().top < window.innerHeight / 3);
      setActive(reached.at(-1)?.id ?? ids[0]);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
    // `key` stands for the ids
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return active;
};
