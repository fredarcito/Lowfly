import { useMemo } from "react";
import { ZOOMS } from "@/components/admin/data/zooms";

// What `key` of `entries` adds up to
const sumOf = (entries, key) => entries.reduce((sum, entry) => sum + (entry[key] ?? 0), 0);

// A trend's days ([{ day, …keys }], oldest first, up to today) at a zoom: its points ({ from, to, …keys }, a day each,
// or a week), the totals of `keys` over them, and over the range before it (null when it was not all counted: before
// `since`, the first day with figures)
export const useZoomed = (entries, keys, zoom, since) =>
  useMemo(() => {
    const { days, step } = ZOOMS[zoom];
    const totalsOf = (chunk) => Object.fromEntries(keys.map((key) => [key, sumOf(chunk, key)]));
    const current = entries.slice(-days);
    const before = entries.slice(-2 * days, -days);
    const points = Array.from({ length: days / step }, (_, index) => {
      const chunk = current.slice(index * step, (index + 1) * step);
      return { from: chunk[0].day, to: chunk.at(-1).day, ...totalsOf(chunk) };
    });
    const counted = since !== null && before.length === days && before[0].day >= since;
    return { points, totals: totalsOf(current), previous: counted ? totalsOf(before) : null };
  }, [entries, keys, zoom, since]);
