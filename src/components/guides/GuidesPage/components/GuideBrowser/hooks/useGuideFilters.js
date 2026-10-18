import { useMemo, useState } from "react";
import { normalize } from "@/utils/format";

// The guides' page's search: the city typed (accents and case aside), the country and the length picked.
// → { query, setQuery, country, setCountry, dayCount, setDayCount, countries, dayCounts, shown }
export const useGuideFilters = (guides, lang) => {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [dayCount, setDayCount] = useState("");
  const countries = useMemo(() => [...new Set(guides.map((guide) => guide.country))].sort((first, second) => first.localeCompare(second, lang)), [guides, lang]);
  const dayCounts = useMemo(() => [...new Set(guides.map((guide) => guide.dayCount))].sort((first, second) => first - second), [guides]);
  const typed = normalize(query.trim());
  const shown = guides.filter(
    (guide) =>
      (!typed || normalize(guide.city).includes(typed) || normalize(guide.country).includes(typed)) &&
      (!country || guide.country === country) &&
      (!dayCount || guide.dayCount === Number(dayCount))
  );
  return { query, setQuery, country, setCountry, dayCount, setDayCount, countries, dayCounts, shown };
};
