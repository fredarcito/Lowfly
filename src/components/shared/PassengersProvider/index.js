"use client";

import { useMemo } from "react";
import { I18nContext, useI18n } from "@/context/i18n";
import { createFormat } from "@/utils/format";

// Around a search's results: everything below knows how many adults it is for (`format.passengers`) and its booking
// links ask the airlines for all of them (`format`, made again with the count).
const PassengersProvider = ({ count, children }) => {
  const i18n = useI18n();
  const value = useMemo(() => ({ ...i18n, format: createFormat(i18n.lang, i18n.texts, count) }), [i18n, count]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export default PassengersProvider;
