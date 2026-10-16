"use client";

// Destination photos in the browser (from /api/photos), shared by every component and fetched once per code.
// One request per airport: each photo shows as soon as it is found (a slow one does not hold the others back), and
// each answer is cached on its own by the CDN and the browser.
import { useEffect, useState } from "react";
import { getPhotos } from "@/api/photos";

const cache = new Map(); // code → photo | null
const pending = new Map(); // code → Promise of the photo | null

// A failed lookup (the request, or the server's: the code is missing) shows no photo but is not remembered:
// the next time it is needed it is asked again
const load = (code) => {
  if (!pending.has(code)) {
    pending.set(
      code,
      getPhotos([code])
        .then((found) => {
          if (code in found) cache.set(code, found[code]);
          return found[code] ?? null;
        })
        .catch(() => null)
        .finally(() => {
          if (!cache.has(code)) pending.delete(code);
        })
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
    load(code).then((found) => live && setPhoto(found));
    return () => {
      live = false;
    };
  }, [code]);
  return photo;
};
