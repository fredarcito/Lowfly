// How many AI itineraries were made in this browser without an account: the first ones are free, then signing
// in is asked for (constants/itineraryLimits). It only lives in this browser (the server keeps its own limit).
const KEY = "lowfly.guestItineraries";

export const guestItineraries = () => {
  try {
    return Number(localStorage.getItem(KEY)) || 0;
  } catch {
    return 0;
  }
};

export const countGuestItinerary = () => {
  try {
    localStorage.setItem(KEY, String(guestItineraries() + 1));
  } catch {}
};
