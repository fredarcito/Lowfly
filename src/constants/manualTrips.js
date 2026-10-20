// Trips planned by hand (form in /trips/new) and AI itineraries (server/itinerary):
// at most this many towns, and this many days from the first arrival to the last departure (any itinerary). A long
// multi-city route (docs/multi-city.md) has up to 9 towns and 14 nights.
export const MAX_STOPS = 9;
export const MAX_TRIP_DAYS = 15;
// At most this many days in one town: each town is planned in a single AI call (server/itinerary)
export const MAX_TOWN_DAYS = 10;
