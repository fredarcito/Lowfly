// The order of the multi-city routes found (docs/multi-city.md, section 5): price, how well the nights fit, the season
// and some variety. Pure: no requests.

// Each night away from a version's ideal stay counts as this many euros
const NIGHT_GAP_EUROS = 6;
// A seasonal route in its season (Christmas markets) and a route in its good months go up; one in the origin's own
// country goes down (people from Madrid know Andalusia)
const SEASON_BONUS = 40;
const GOOD_MONTH_BONUS = 10;
const HOME_COUNTRY_PENALTY = 20;
// Among the first results: at least one surprise, and not two routes starting in the same country
const TOP = 3;
const VARIED = 5;

// What a route's month and country add to (or take from) its price
const adjustment = (route, month, homeCountry) =>
  (route.season ? -SEASON_BONUS : 0) - (route.months?.includes(month) ? GOOD_MONTH_BONUS : 0) + (route.countries.includes(homeCountry) ? HOME_COUNTRY_PENALTY : 0);

// A trip's score: its price, plus the nights it is away from its ideal stay
export const tripScore = (trip) => trip.price + NIGHT_GAP_EUROS * Math.abs(trip.nights - trip.idealNights);

// The routes worth asking prices for, from the screening's cheapest flight in to each (`entryPrice`, Infinity when
// none was found): [{ route, entryPrice }] → at most `limit` routes, the seasonal ones in season and a couple of
// surprises always among them
export const pickCandidates = (candidates, { limit, month, homeCountry }) => {
  const found = candidates.filter((candidate) => Number.isFinite(candidate.entryPrice));
  const scored = found
    .map((candidate) => ({ ...candidate, score: candidate.entryPrice + adjustment(candidate.route, month, homeCountry) }))
    .sort((first, second) => first.score - second.score);
  const surprises = scored.filter((candidate) => candidate.route.kind === "surprise").slice(0, 2);
  const seasonal = scored.filter((candidate) => candidate.route.season).slice(0, 2);
  const picked = [...new Set([...seasonal, ...surprises, ...scored])].slice(0, limit);
  return picked.map((candidate) => candidate.route);
};

// Moves `item` to `position` in `list` (a new list)
const moveTo = (list, item, position) => {
  const rest = list.filter((other) => other !== item);
  return [...rest.slice(0, position), item, ...rest.slice(position)];
};

// The routes with their trips ([{ route, trips }]) in the order shown: best score first (its best trip), a surprise
// among the first TOP, and the first VARIED starting in different countries when possible
export const rankRoutes = (results, { month, homeCountry }) => {
  let ranked = results
    .map((result) => ({ ...result, score: Math.min(...result.trips.map(tripScore)) + adjustment(result.route, month, homeCountry) }))
    .sort((first, second) => first.score - second.score);

  const firstCountry = (result) => result.route.countries[0];
  for (let position = 1; position < Math.min(VARIED, ranked.length); position++) {
    const seen = new Set(ranked.slice(0, position).map(firstCountry));
    if (!seen.has(firstCountry(ranked[position]))) continue;
    const other = ranked.slice(position + 1).find((result) => !seen.has(firstCountry(result)));
    if (other) ranked = moveTo(ranked, other, position);
  }

  const top = ranked.slice(0, TOP);
  const surprise = ranked.slice(TOP).find((result) => result.route.kind === "surprise");
  if (surprise && !top.some((result) => result.route.kind === "surprise")) ranked = moveTo(ranked, surprise, TOP - 1);
  return ranked;
};
