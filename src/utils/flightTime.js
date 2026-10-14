// How long a flight takes, from its local departure and arrival times and the airports' time zones
// (Malta → London leaves at 06:15 and lands at 07:50, but that is 2 h 35 min, not 1 h 35 min).

// Minutes the time zone is ahead of UTC on that day ("Europe/Malta" in summer → 120)
const utcOffsetMinutes = (timeZone, day) => {
  const name = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" })
    .formatToParts(new Date(`${day}T12:00:00Z`))
    .find((part) => part.type === "timeZoneName").value; // "GMT+02:00", or "GMT" for UTC
  const match = name.match(/GMT([+-])(\d{2}):(\d{2})/);
  return match ? (match[1] === "-" ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3])) : 0;
};

const minutesOfDay = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

// Flight length in minutes, or null without the arrival time or a time zone.
// leg: { day, time, arrive } (local times); fromZone / toZone: IANA time zones of the two airports.
export const flightMinutes = (leg, fromZone, toZone) => {
  if (!leg.arrive || !leg.time || !fromZone || !toZone) return null;
  const departure = minutesOfDay(leg.time) - utcOffsetMinutes(fromZone, leg.day);
  let arrival = minutesOfDay(leg.arrive) - utcOffsetMinutes(toZone, leg.day);
  while (arrival <= departure) arrival += 24 * 60; // lands after midnight (UTC)
  const minutes = arrival - departure;
  return minutes < 20 * 60 ? minutes : null; // a short-haul flight never takes this long: the data is wrong
};
