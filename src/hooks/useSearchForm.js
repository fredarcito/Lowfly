"use client";

import { useEffect, useState } from "react";
import { getDefaultOrigin } from "@/api/airports";
import { useDestinationCountries } from "@/hooks/useDestinationCountries";
import { savedOrigin, saveOrigin } from "@/store/origin";
import { nextFriday, shift, tomorrow } from "@/utils/dates";
import { keptDestination } from "@/utils/destinations";
import { searchFromParams } from "@/utils/share";
import { DEFAULT_ORIGIN } from "@/constants/airports";

const EMPTY_FORM = {
  origin: "",
  country: "",
  city: "",
  from: "",
  to: "",
  ida: "",
  vuelta: "",
  flex: "2",
  max: "",
  trip: "oneway",
  minN: "2",
  maxN: "4",
  weekend: false,
};

// How many days ahead the default search range ends
const DEFAULT_RANGE_DAYS = 60;
// The default flexible trip: next Friday to Monday
const DEFAULT_TRIP_NIGHTS = 3;

// The search form's fields and mode. In the browser (to avoid hydration mismatches) it fills the default dates,
// a shared link's search (?m=…&o=…, run straight away with `onShared` unless its dates have passed) and, on a
// first visit, the departure airport of the visitor's country. It also loads where the departure airport flies
// (`countries`) and, when that changes, keeps the chosen destination if the new airport flies there.
export const useSearchForm = ({ lang, onShared }) => {
  const [mode, setMode] = useState("everywhere");
  const [form, setForm] = useState(EMPTY_FORM);
  const countries = useDestinationCountries(form.origin, lang);

  useEffect(() => {
    const firstDay = tomorrow();
    const friday = nextFriday();
    const defaults = {
      ...EMPTY_FORM,
      origin: savedOrigin(),
      from: firstDay,
      to: shift(firstDay, DEFAULT_RANGE_DAYS),
      ida: friday,
      vuelta: shift(friday, DEFAULT_TRIP_NIGHTS),
    };

    const shared = searchFromParams(new URLSearchParams(window.location.search));
    if (shared) {
      const fields = { ...defaults, ...shared.fields };
      setForm(fields);
      setMode(shared.mode);
      if (!shared.stale) onShared(fields, shared.mode);
      return;
    }
    setForm(defaults);

    if (savedOrigin()) return;
    getDefaultOrigin(Intl.DateTimeFormat().resolvedOptions().timeZone)
      .catch(() => DEFAULT_ORIGIN)
      .then((origin) => setForm((current) => (current.origin ? current : { ...current, origin })));
    // Only once, on arrival
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (countries.status === "ok") setForm((current) => ({ ...current, ...keptDestination(countries.list, current) }));
  }, [countries]);

  const setField = (name, value) => {
    if (name === "origin") saveOrigin(value);
    setForm((current) => ({ ...current, [name]: value }));
  };

  return { mode, setMode, form, setForm, setField, countries };
};
