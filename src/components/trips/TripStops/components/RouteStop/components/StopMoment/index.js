"use client";

import { useI18n } from "@/context/i18n";

// When they arrive or leave a town, as a figure: label, the day and, below, the time (when there is one)
const StopMoment = ({ icon: Icon, label, moment }) => {
  const { format } = useI18n();
  return (
    <div className="grid content-start gap-0.5">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5 shrink-0" /> {label}
      </dt>
      <dd className="font-medium first-letter:uppercase">{format.fmtDay(moment.day)}</dd>
      {moment.time && <dd className="text-sm text-muted-foreground tabular-nums">{moment.time}</dd>}
    </div>
  );
};

export default StopMoment;
