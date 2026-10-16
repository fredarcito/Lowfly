"use client";

// Destination photos in the browser (from /api/photos), shared by every component and fetched once per code.
// One request per airport: each photo shows as soon as it is found (a slow one does not hold the others back), and
// each answer is cached on its own by the CDN and the browser.
import { useEffect, useState } from "react";
import { getPhotos } from "@/api/photos";

const cache = new Map(); // code → photo | null
const pending = new Map(); // code → Promise

const load = (code) => {
  if (!pending.has(code)) {
    pending.set(
      code,
      getPhotos([code])
        .catch(() => ({}))
        .then((found) => cache.set(code, found[code] ?? null))
    );
  }
  return pending.get(code);
};

// undefined while loading, null when there is no photo
export const usePhoto = (code) => {
  const [photo, setPhoto] = useState(() => cache.get(code));
  useEffect(() => {
    if (!code) return;
    if (cache.has(code)) return setPhoto(cache.get(code));
    let live = true;
    load(code).then(() => live && setPhoto(cache.get(code)));
    return () => {
      live = false;
    };
  }, [code]);
  return photo;
};
