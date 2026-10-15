"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { listKeyDown } from "@/utils/listKeys";

// A search box over a list of options (airport, destination pickers): what is typed, the options that match
// (`search(query)`), the highlighted one (the arrows move it, Enter picks it) and the list scrolled to it.
// `startAt(options)`: the option highlighted on opening (the current value), so the list opens on it.
export const useSearchableList = ({ search, startAt = () => 0, onPick }) => {
  const listId = useId();
  const listRef = useRef(null);
  const [query, setQuery] = useState("");
  const shown = useMemo(() => search(query), [search, query]);
  const [active, setActive] = useState(() => Math.max(0, startAt(search(""))));

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const changeQuery = (text) => {
    setQuery(text);
    setActive(0);
  };

  const onKeyDown = listKeyDown({ count: shown.length, active, setActive, onPick: (index) => onPick(shown[index]) });

  return { listId, listRef, query, changeQuery, shown, active, setActive, onKeyDown };
};
