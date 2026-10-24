"use client";

import { useEffect, useState } from "react";
import { getDefaultOrigin } from "@/api/airports";
import { useDestinationCountries } from "@/components/search/FlightSearch/hooks/useDestinationCountries";
import { savedOrigin, saveOrigin } from "@/store/origin";
import { nextFriday, shift, tomorrow } from "@/utils/dates";
import { keptDestination } from "@/utils/destinations";
import { searchFromParams } from "@/utils/share";
import { DEFAULT_ORIGIN } from "@/constants/airports";
import { DEFAULT_RANGE_DAYS } from "@/constants/searchForm";

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
  // Most trips come back: return by default
  trip: "return",
  minN: "2",
  maxN: "4",
  weekend: false,
  // Adults (1 to MAX_PASSENGERS), a string like the other fields: the fares stay per person, it only changes the
  // totals shown and what the booking links ask for
  passengers: "1",
  // The days someone is free, for a multi-city route (5 to 15 days)
  freeFrom: "",
  freeTo: "",
};

// The default flexible trip: next Friday to Monday
const DEFAULT_TRIP_NIGHTS = 3;
// The default free days for a route: from next Friday, a week and a half (a short or a week-long route fits)
const DEFAULT_FREE_NIGHTS = 9;

// The search form's fields, for the kind of search of the page (`mode`). In the browser (to avoid hydration
// mismatches) it fills the default dates, a shared link's search (?o=…, run straight away with `onShared` unless its
// dates have passed) and, on a first visit, the departure airport of the visitor's country. It also loads where the
// departure airport flies (`countries`) and, when that changes, keeps the chosen destination if the new airport
// flies there.
export const useSearchForm = ({ lang, mode, onShared }) => {
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
      freeFrom: friday,
      freeTo: shift(friday, DEFAULT_FREE_NIGHTS),
    };

    const shared = searchFromParams(new URLSearchParams(window.location.search), mode);
    if (shared) {
      const fields = { ...defaults, ...shared.fields };
      setForm(fields);
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

  return { form, setForm, setField, countries };
};
