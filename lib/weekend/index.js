// A real weekend away: leave Friday or Saturday morning, come back Sunday afternoon or early Monday.
// Each slot is a weekday (0 = Sunday … 6 = Saturday, Ryanair's name) and a departure time window.
import { parseDay, shift } from "@/lib/dates";

export const WEEKEND = {
  out: [
    { dow: 5, name: "FRIDAY", from: "01:00", to: "23:59" },
    { dow: 6, name: "SATURDAY", from: "00:00", to: "11:59" },
  ],
  ret: [
    { dow: 0, name: "SUNDAY", from: "15:00", to: "23:59" },
    { dow: 1, name: "MONDAY", from: "00:00", to: "09:00" },
  ],
  stay: { min: 1, max: 3, weekend: true },
};

// Does a flight on `day` ("YYYY-MM-DD") at `time` ("HH:MM") fit one of the slots?
export const fits = (slots, day, time) =>
  !!time && slots.some((s) => s.dow === parseDay(day).getDay() && time >= s.from && time <= s.to);

// No time off work: out on Friday from 17:00 or on Saturday, back on Sunday.
// (An early Monday flight usually lands too late to be at work on time.)
export const noTimeOff = (f) =>
  ((parseDay(f.out.day).getDay() === 5 && f.out.time >= "17:00") || parseDay(f.out.day).getDay() === 6) &&
  parseDay(f.ret.day).getDay() === 0;

// Hours at the destination: from the outbound landing to the return take-off (both local times there)
export function hoursAway(out, ret) {
  if (!out.arrive || !ret.time) return null;
  const landDay = out.arrive < out.time ? shift(out.day, 1) : out.day; // lands after midnight
  const ms = new Date(`${ret.day}T${ret.time}:00Z`) - new Date(`${landDay}T${out.arrive}:00Z`);
  return ms > 0 ? Math.round(ms / 36e5) : null;
}

// The next `count` weekends, Friday to Monday: from the coming Friday (or today, if it is Friday before the evening)
export function nextWeekends(count, now = new Date()) {
  const d = new Date(now);
  const late = d.getDay() === 5 && d.getHours() >= 17;
  d.setDate(d.getDate() + (late ? 7 : (5 - d.getDay() + 7) % 7));
  const fri = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return Array.from({ length: count }, (_, i) => ({ from: shift(fri, 7 * i), to: shift(fri, 7 * i + 3) }));
}
