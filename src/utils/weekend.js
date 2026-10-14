// Weekend trips (the slots are in constants/weekend): which flights fit, time off work, hours away, next weekends
import { iso, parseDay, shift } from "@/utils/dates";

// Does a flight on `day` ("YYYY-MM-DD") at `time` ("HH:MM") fit one of the slots?
export const fits = (slots, day, time) =>
  !!time && slots.some((slot) => slot.dow === parseDay(day).getDay() && time >= slot.from && time <= slot.to);

// No time off work: out on Friday from 17:00 or on Saturday, back on Sunday.
// (An early Monday flight usually lands too late to be at work on time.)
export const noTimeOff = (fare) =>
  ((parseDay(fare.out.day).getDay() === 5 && fare.out.time >= "17:00") || parseDay(fare.out.day).getDay() === 6) &&
  parseDay(fare.ret.day).getDay() === 0;

// Hours at the destination: from the outbound landing to the return take-off (both local times there)
export function hoursAway(out, ret) {
  if (!out.arrive || !ret.time) return null;
  const landDay = out.arrive < out.time ? shift(out.day, 1) : out.day; // lands after midnight
  const milliseconds = new Date(`${ret.day}T${ret.time}:00Z`) - new Date(`${landDay}T${out.arrive}:00Z`);
  return milliseconds > 0 ? Math.round(milliseconds / 36e5) : null;
}

// The next `count` weekends, Friday to Monday: from the coming Friday (or today, if it is Friday before the evening)
export function nextWeekends(count, now = new Date()) {
  const friday = new Date(now);
  const late = friday.getDay() === 5 && friday.getHours() >= 17;
  friday.setDate(friday.getDate() + (late ? 7 : (5 - friday.getDay() + 7) % 7));
  const first = iso(friday);
  return Array.from({ length: count }, (_, week) => ({ from: shift(first, 7 * week), to: shift(first, 7 * week + 3) }));
}
