"use client";

// A destination's "why go", shared by every component and fetched once per code and language
import { useEffect, useState } from "react";
import { getGuides } from "@/api/guides";
import { useI18n } from "@/context/i18n";

const cache = new Map(); // "BRI es" → guide | null
const pending = new Map(); // "BRI es" → Promise

const load = (code, lang) => {
  const key = `${code} ${lang}`;
  if (!pending.has(key))
    pending.set(
      key,
      getGuides([code], lang)
        .catch(() => ({}))
        .then((found) => cache.set(key, found[code] ?? null))
    );
  return pending.get(key);
};

// undefined while loading, null when there is none
export const useDestinationGuide = (code) => {
  const { lang } = useI18n();
  const key = `${code} ${lang}`;
  const [guide, setGuide] = useState(() => cache.get(key));
  useEffect(() => {
    if (!code) return;
    if (cache.has(key)) return setGuide(cache.get(key));
    let live = true;
    load(code, lang).then(() => live && setGuide(cache.get(key)));
    return () => {
      live = false;
    };
  }, [code, lang, key]);
  return guide;
};
