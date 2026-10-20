// Which multi-city routes can be flown from an origin, from the route graph alone (no requests): a flight from the
// origin to the first stop of a version and one home from its last stop (docs/multi-city.md, section 2).

export const VERSIONS = ["short", "full", "long"];

// A version's stops in the order travelled. Done backwards (a reversible route), the way by land to the next stop
// is the one the previous stop had: [{ ...stop, index }] (`index`: its place in the route as written)
export const stopsInDirection = (stops, direction) => {
  const written = stops.map((stop, index) => ({ ...stop, index }));
  if (direction === "forward") return written;
  const last = written.length - 1;
  return written
    .slice()
    .reverse()
    .map(({ land, ...stop }, position) => (position < last ? { ...stop, land: written[last - 1 - position].land } : stop));
};

// The airports among `codes` with a flight from `from` (or to `to`), with their airlines: [{ code, airlines }]
const flownFrom = (graph, from, codes) => codes.filter((code) => graph[from]?.[code]).map((code) => ({ code, airlines: graph[from][code] }));
const flownTo = (graph, codes, to) => codes.filter((code) => graph[code]?.[to]).map((code) => ({ code, airlines: graph[code][to] }));

// Every way to do a route from `origin`: per version and direction (both when it is reversible), with the airports
// to fly into (`entry`) and home from (`exit`). [{ route, version, direction, stops, entry, exit }]
export const possibleOptions = (origin, routes, graph) =>
  routes.flatMap((route) =>
    VERSIONS.filter((version) => route.versions[version]).flatMap((version) =>
      (route.reversible ? ["forward", "reverse"] : ["forward"]).flatMap((direction) => {
        const stops = stopsInDirection(route.versions[version].stops, direction);
        const entry = flownFrom(graph, origin, stops[0].codes);
        const exit = flownTo(graph, stops.at(-1).codes, origin);
        return entry.length && exit.length ? [{ route, version, direction, stops, entry, exit }] : [];
      })
    )
  );
