"use client";

import { LogIn, LogOut } from "lucide-react";
import PreferencePicker from "@/components/trips/itinerary/PreferencePicker";
import { useI18n } from "@/context/i18n";

// Times to pick, every half hour from 06:00 (the small hours go last, so the usual ones show first);
// "none" plans the whole day
const NO_TIME = "none";
const FIRST_HOUR = 6;
const HALF_HOURS = 48;
const TIMES = Array.from({ length: HALF_HOURS }, (_, halfHour) => {
  const hour = (Math.floor(halfHour / 2) + FIRST_HOUR) % 24;
  return `${String(hour).padStart(2, "0")}:${halfHour % 2 ? "30" : "00"}`;
});

// The arrival and departure times of a town, side by side (also on phones). Empty: no time.
const StopTimes = ({ id, arriveTime, leaveTime, onChange }) => {
  const { texts } = useI18n();
  const labels = texts.trips.manual;
  const options = [{ id: NO_TIME, label: labels.noTime }, ...TIMES.map((time) => ({ id: time, label: time }))];
  const fromOption = (time) => (time === NO_TIME ? "" : time);
  return (
    <div className="grid grid-cols-2 gap-3 sm:col-span-2 lg:col-span-1">
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
  );
};

export default StopTimes;
