// Search modes that can look only for weekends away (anywhere, and a country or city)
export const WEEKEND_MODES = ["everywhere", "country"];

// A real weekend away: leave Friday or Saturday morning, come back Sunday afternoon or early Monday.
// Each slot is a weekday (0 = Sunday … 6 = Saturday, Ryanair's name) and a departure time window.
export const WEEKEND = {
  out: [
    // Friday in two slots so Ryanair also returns the cheapest after work (see noTimeOff), not only the cheapest of the day
    { dow: 5, name: "FRIDAY", from: "01:00", to: "16:59" },
    { dow: 5, name: "FRIDAY", from: "17:00", to: "23:59" },
    { dow: 6, name: "SATURDAY", from: "00:00", to: "11:59" },
  ],
  ret: [
    { dow: 0, name: "SUNDAY", from: "15:00", to: "23:59" },
    { dow: 1, name: "MONDAY", from: "00:00", to: "09:00" },
  ],
  stay: { min: 1, max: 3, weekend: true },
};
