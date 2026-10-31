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
// (read from the cache while rendering; the state only keeps the last answer, as a failed one is not cached)
export const usePhoto = (code) => {
  const [loaded, setLoaded] = useState(null); // { code, photo }
  useEffect(() => {
    if (!code || cache.has(code)) return;
    let live = true;
    load(code).then((photo) => live && setLoaded({ code, photo }));
    return () => {
      live = false;
    };
  }, [code]);
  if (cache.has(code)) return cache.get(code);
  return loaded?.code === code ? loaded.photo : undefined;
};
