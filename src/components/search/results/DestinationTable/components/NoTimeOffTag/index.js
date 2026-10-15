"use client";

import { useI18n } from "@/context/i18n";

const NoTimeOffTag = () => {
  const { texts } = useI18n();
  return (
    <span title={texts.results.noTimeOffHint} className="rounded-full bg-save/15 px-2 py-0.5 text-xs font-medium text-save">
      {texts.results.noTimeOff}
    </span>
  );
};

export default NoTimeOffTag;
