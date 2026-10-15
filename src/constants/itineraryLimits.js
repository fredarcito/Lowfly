// How many AI itineraries people can make (the AI costs money per call)
export const ITINERARY_LIMITS = {
  // Without an account, in one browser: the first one is free, then they are asked to sign in
  freeInBrowser: 1,
  // Without an account, per IP address and day (so a private window does not give endless free ones)
  guestPerDay: 2,
  // With an account, per person and day
  userPerDay: 5,
};
