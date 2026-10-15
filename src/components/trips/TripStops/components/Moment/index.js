"use client";

import { useI18n } from "@/context/i18n";

// "Thu 13 Nov · 10:00", or only the day when there is no time
const Moment = ({ icon: Icon, label, moment }) => {
  const { format } = useI18n();
  return (
    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Icon className="size-3.5 shrink-0" />
      <span>
        {label} <span className="text-foreground first-letter:uppercase">{format.fmtDay(moment.day)}</span>
        {moment.time && <span className="text-foreground tabular-nums"> · {moment.time}</span>}
      </span>
    </p>
  );
};

export default Moment;
