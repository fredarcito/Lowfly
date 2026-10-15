"use client";

import { ChevronDown, Clock, LogIn, LogOut } from "lucide-react";
import Collapse from "@/components/shared/Collapse";
import PreferencePicker from "@/components/trips/itinerary/PreferencePicker";
import { useI18n } from "@/context/i18n";
import { useDisclosure } from "@/hooks/useDisclosure";
import { cn } from "@/utils/cn";

// Times to pick, every half hour from 06:00 (the small hours go last, so the usual ones show first);
// "none" plans the whole day
const NO_TIME = "none";
const FIRST_HOUR = 6;
const HALF_HOURS = 48;
const TIMES = Array.from({ length: HALF_HOURS }, (_, halfHour) => {
  const hour = (Math.floor(halfHour / 2) + FIRST_HOUR) % 24;
  return `${String(hour).padStart(2, "0")}:${halfHour % 2 ? "30" : "00"}`;
});

// A town's arrival and departure times, folded away (most people do not know them, and without them the whole
// day is planned): a row that unfolds them smoothly, saying "Optional" or, once set, the times chosen
const StopTimes = ({ id, arriveTime, leaveTime, onChange }) => {
  const { texts } = useI18n();
  const labels = texts.trips.manual;
  const fold = useDisclosure(Boolean(arriveTime || leaveTime));
  const options = [{ id: NO_TIME, label: labels.noTime }, ...TIMES.map((time) => ({ id: time, label: time }))];
  const fromOption = (time) => (time === NO_TIME ? "" : time);
  const chosen = labels.timesSet(arriveTime, leaveTime);

  return (
    <div className="grid gap-2 border-t pt-4">
      <button
        type="button"
        onClick={fold.toggle}
        aria-expanded={fold.open}
        aria-controls={`${id}-times`}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left ring-1 ring-foreground/10 transition-colors duration-200 outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Clock className="size-5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">
          <span className="sm:hidden">{labels.addTimesShort}</span>
          <span className="max-sm:hidden">{labels.addTimes}</span>
        </span>
        <span key={chosen || "optional"} className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground duration-300 animate-in fade-in motion-reduce:animate-none">
          {chosen || labels.optional}
        </span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-300", fold.open && "rotate-180")} />
      </button>
      <Collapse open={fold.open}>
        <div id={`${id}-times`} className="grid grid-cols-2 gap-3 pt-2 pb-1">
          <PreferencePicker
            id={`${id}-arrive-time`}
            icon={LogIn}
            label={labels.arrivalTime}
            options={options}
            value={arriveTime || NO_TIME}
            onChange={(time) => onChange({ arriveTime: fromOption(time) })}
          />
          <PreferencePicker
            id={`${id}-leave-time`}
            icon={LogOut}
            label={labels.departureTime}
            options={options}
            value={leaveTime || NO_TIME}
            onChange={(time) => onChange({ leaveTime: fromOption(time) })}
          />
        </div>
      </Collapse>
      {!chosen && <p className="text-xs text-muted-foreground">{labels.timesHint}</p>}
    </div>
  );
};

export default StopTimes;
