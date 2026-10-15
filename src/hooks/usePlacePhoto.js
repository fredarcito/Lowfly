"use client";

// A town's photo in the browser (from /api/photos/place), fetched once per town. `place`: { city, lat, lng } or null.
import { useEffect, useState } from "react";
import { getPlacePhoto } from "@/api/photos";
import { useI18n } from "@/context/i18n";

const cache = new Map(); // place key → photo | null
const pending = new Map(); // place key → Promise

const keyOf = (place) => (place ? `${place.city}@${place.lat},${place.lng}` : null);

const load = (place, lang) => {
  const key = keyOf(place);
  if (!pending.has(key)) {
    pending.set(
      key,
      getPlacePhoto(place, lang)
        .catch(() => null)
        .then((photo) => cache.set(key, photo))
    );
  }
  return pending.get(key);
};

// undefined while loading, null when there is no photo
export const usePlacePhoto = (place) => {
  const { lang } = useI18n();
  const key = keyOf(place);
  const [photo, setPhoto] = useState(() => cache.get(key));
  useEffect(() => {
    if (!place) return;
    if (cache.has(key)) return setPhoto(cache.get(key));
    let live = true;
    load(place, lang).then(() => live && setPhoto(cache.get(key)));
    return () => {
      live = false;
    };
    // The place is known by its key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, lang]);
  return photo;
};
