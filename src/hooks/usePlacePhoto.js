"use client";

// A town's photo in the browser (from /api/photos/place), fetched once per town. `place`: { city, lat, lng } or null.
import { useEffect, useState } from "react";
import { getPlacePhoto } from "@/api/photos";
import { useI18n } from "@/context/i18n";

const cache = new Map(); // place key → photo | null
const pending = new Map(); // place key → Promise

const keyOf = (place) => (place ? `${place.city}@${place.lat},${place.lng}` : null);

// A failed request shows no photo but is not remembered: the next time it is needed it is asked again
const load = (place, lang) => {
  const key = keyOf(place);
  if (!pending.has(key)) {
    pending.set(
      key,
      getPlacePhoto(place, lang)
        .then((photo) => {
          cache.set(key, photo);
          return photo;
        })
        .catch(() => {
          pending.delete(key);
          return null;
        })
    );
  }
  return pending.get(key);
};

// undefined while loading, null when there is no photo (read from the cache while rendering; the state only keeps
// the last answer, as a failed one is not cached)
export const usePlacePhoto = (place) => {
  const { lang } = useI18n();
  const key = keyOf(place);
  const [loaded, setLoaded] = useState(null); // { key, photo }
  useEffect(() => {
    if (!place || cache.has(key)) return;
    let live = true;
    load(place, lang).then((photo) => live && setLoaded({ key, photo }));
    return () => {
      live = false;
    };
    // The place is known by its key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, lang]);
  if (cache.has(key)) return cache.get(key);
  return loaded?.key === key ? loaded.photo : undefined;
};
