// What the admin's "Uso" page counts about the searches (server/metrics, api/metrics): the kinds of search, and how a
// search may end besides finding something ("results") or nothing ("empty"): the error codes it can answer with
// (texts.errors). Anything else is counted as "unknown".
export const SEARCH_MODES = ["everywhere", "country", "trip", "multiCity"];
export const SEARCH_ERRORS = [
  "badOrigin",
  "missingDate",
  "missingCountry",
  "rangeOrder",
  "rangeTooLong",
  "stayInvalid",
  "stayTooShort",
  "returnBeforeOut",
  "noAirlines",
  "noRoutes",
  "noPrices",
  "outPast",
  "multiCityTooShort",
  "tooManySearches",
  "searchesToday",
  "notHuman",
  "unknown",
];
