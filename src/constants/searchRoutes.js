// The API routes of the flight searches: the ones that may ask the airlines, so they go through `handleSearch`
// (server/handler: BotID and the visitor's limit). A new one goes here too.
export const SEARCH_ROUTES = ["/api/country", "/api/everywhere", "/api/flexible", "/api/multi-city", "/api/stopovers"];
