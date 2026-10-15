"use client";

// Destination photos in the browser (from /api/photos), shared by every component and fetched once per code.
// The codes asked for at the same time (a row of cards) go in a single request.
import { useEffect, useState } from "react";
import { getPhotos } from "@/api/photos";

const cache = new Map(); // code → photo | null
const pending = new Map(); // code → Promise
let batch = null; // { codes, promise } still collecting codes

// The request for every code asked for in this tick
const requestBatch = () => {
  const current = { codes: [], promise: null };
  current.promise = new Promise((resolve) => setTimeout(resolve, 0))
    .then(() => {
      batch = null;
      return getPhotos(current.codes);
    })
    .catch(() => ({}))
    .then((found) => current.codes.forEach((code) => cache.set(code, found[code] ?? null)));
  return current;
};

const load = (code) => {
  if (!pending.has(code)) {
    batch ??= requestBatch();
    batch.codes.push(code);
    pending.set(code, batch.promise);
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
