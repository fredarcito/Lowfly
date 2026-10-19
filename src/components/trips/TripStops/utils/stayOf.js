import { nightsBetween } from "@/utils/dates";
import { minutesOfDay } from "@/utils/flightTime";

// How long they stay in a town: nights, or, arriving and leaving the same day, the hours between (when both times
// are known); a same-day stop without them is just passing through
const stayOf = (stop) => {
  const nights = nightsBetween(stop.arrive.day, stop.leave.day);
  if (nights > 0) return { nights };
  if (stop.arrive.time && stop.leave.time) {
    const minutes = minutesOfDay(stop.leave.time) - minutesOfDay(stop.arrive.time);
    if (minutes > 0) return { minutes };
  }
  return { passing: true };
};

export default stayOf;
