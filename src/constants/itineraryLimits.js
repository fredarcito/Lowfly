// How many AI itineraries people can make (the AI costs money per call)
export const ITINERARY_LIMITS = {
  // Switch: after the free itinerary(s), ask to sign in to make more. Off while testing: then nobody is asked,
  // and visitors without an account get the same daily allowance as signed-in people (per IP), so the AI cost
  // stays capped.
  requireAccount: false,
  // Without an account, in one browser: the first one is free, then they are asked to sign in
  freeInBrowser: 1,
  // Without an account, per IP address and day (so a private window does not give endless free ones)
  guestPerDay: 2,
  // With an account, per person and day
  userPerDay: 5,
};
