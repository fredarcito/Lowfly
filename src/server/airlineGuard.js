// What keeps the airlines' unofficial APIs (Wizz Air, Ryanair) from blocking us: they answer 429/403/503 when asked
// too much. Every request goes through `airlineJson`. In front, this instance's memory keeps the answers used last
// for a few minutes, so the most searched ones do not even reach Redis. Then Redis (server/redis), across all the
// server instances:
// - keeps each answer for a while, so the same month of the same route is asked once for every visitor;
// - lets a single instance ask at a time: the others wait for its answer;
// - asks at most `perSecond` requests a second;
// - after a block, stops asking for a few minutes (longer if it repeats) and serves what it kept, even if old.
// Without Redis, only this instance's memory and the requests already on their way in it are shared. Only called
// from the server.
import { redis, redisKey } from "@/server/redis";

// The answers that mean "too many requests"
const BLOCKING = [403, 429, 503];
// How long a block stops the requests: a minute, doubled each time it repeats in the hour, up to 10. Wizz lets us
// back in after a few minutes, so a longer pause would only leave its fares out
const BLOCK_SECONDS = 60;
const MAX_BLOCK_SECONDS = 600;
// How long an instance waits for another one asking the same, and for its turn when the airline is busy
const LOCK_MS = 10_000;
const MAX_TURN_WAIT_MS = 8_000;
const POLL_MS = 300;
// This instance's memory: an answer is kept up to 5 minutes (never beyond its `fresh`), the 300 used last
const MEMORY_MS = 5 * 60_000;
const MEMORY_SIZE = 300;

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

// A Redis call that never breaks a search: when Redis fails, `fallback`
const safely = async (call, fallback = null) => {
  try {
    return await call();
  } catch (error) {
    console.error("Redis", error.message);
    return fallback;
  }
};

export class AirlineBlocked extends Error {
  constructor(airline) {
    super(`${airline} is blocking our requests: paused for a few minutes`);
    this.airline = airline;
  }
}

// The fetch options for an airline request: with Redis the answer is kept there, so not in Next's cache too
export const fetchCacheOptions = (revalidate) => (redis() ? { cache: "no-store" } : { next: { revalidate } });

// The error for a failed answer, with its status and how long the airline asks us to wait (Retry-After)
export const responseError = (airline, response) =>
  Object.assign(new Error(`${airline} responded with error ${response.status}`), {
    status: response.status,
    retryAfter: Number(response.headers.get("retry-after")) || null,
  });

const isBlocked = (store, airline) => safely(() => store.exists(redisKey(airline, "blocked")), 0);

const block = async (store, airline, status, retryAfter) => {
  const strikesKey = redisKey(airline, "strikes");
  const strikes = await safely(() => store.incr(strikesKey), 1);
  if (strikes === 1) await safely(() => store.expire(strikesKey, 3600));
  const seconds = retryAfter || Math.min(BLOCK_SECONDS * 2 ** (strikes - 1), MAX_BLOCK_SECONDS);
  await safely(() => store.set(redisKey(airline, "blocked"), strikes, { ex: seconds }));
  console.warn(`${airline} blocked us (${status}, strike ${strikes}): pausing its requests for ${seconds}s`);
};

// Waits for a free slot in this second's quota; gives up (an error) after MAX_TURN_WAIT_MS
const takeTurn = async (store, airline, perSecond) => {
  const giveUpAt = Date.now() + MAX_TURN_WAIT_MS;
  while (Date.now() < giveUpAt) {
    const second = Math.floor(Date.now() / 1000);
    const turnKey = redisKey(airline, "rate", second);
    const count = await safely(() => store.incr(turnKey), 0);
    if (count === 1) await safely(() => store.expire(turnKey, 2));
    if (count <= perSecond) return;
    await sleep((second + 1) * 1000 - Date.now() + Math.random() * 100);
  }
  throw new Error(`${airline} is busy: too many requests waiting`);
};

// Another instance is asking the same: its answer, once it keeps it (null if it does not in LOCK_MS)
const awaitAnswer = async (store, cacheKey, lockKey, after) => {
  const giveUpAt = Date.now() + LOCK_MS;
  while (Date.now() < giveUpAt) {
    await sleep(POLL_MS);
    const cached = await safely(() => store.get(cacheKey));
    if (cached && cached.at > after) return cached;
    if (!(await safely(() => store.exists(lockKey), 0))) return null;
  }
  return null;
};

// The answer for `key`: { at, data, stale }. at: when the airline gave it; stale: an old one, served because the
// airline failed or blocks us
const load = async (airline, key, request, { fresh, keep, perSecond }) => {
  const store = redis();
  if (!store) return { at: Date.now(), data: await request() };

  const cacheKey = redisKey(airline, "cache", key);
  const lockKey = redisKey(airline, "lock", key);
  const cached = await safely(() => store.get(cacheKey));
  if (cached && Date.now() - cached.at < fresh * 1000) return cached;

  let locked = false;
  try {
    if (await isBlocked(store, airline)) throw new AirlineBlocked(airline);
    locked = Boolean(await safely(() => store.set(lockKey, 1, { nx: true, px: LOCK_MS }), true));
    if (!locked) {
      const answer = await awaitAnswer(store, cacheKey, lockKey, cached?.at ?? 0);
      if (answer) return answer;
      // The other one did not get it: ask ourselves, unless that was because of a block
      if (await isBlocked(store, airline)) throw new AirlineBlocked(airline);
    }
    await takeTurn(store, airline, perSecond);
    const answer = { at: Date.now(), data: await request() };
    await safely(() => store.set(cacheKey, answer, { ex: keep }));
    return answer;
  } catch (error) {
    // Several requests can fail together: one block counts once
    if (BLOCKING.includes(error.status) && !(await isBlocked(store, airline))) await block(store, airline, error.status, error.retryAfter);
    // An old answer beats none: the price is confirmed at the airline anyway
    if (cached) return { ...cached, stale: true };
    throw error;
  } finally {
    if (locked) await safely(() => store.del(lockKey));
  }
};

const memory = new Map(); // `${airline}:${key}` → { until, data }, the one used last at the end

const remembered = (id) => {
  const entry = memory.get(id);
  if (!entry) return undefined;
  memory.delete(id);
  if (entry.until < Date.now()) return undefined;
  memory.set(id, entry);
  return entry.data;
};

const remember = (id, { at, data, stale }, fresh) => {
  const until = Math.min(at + fresh * 1000, Date.now() + MEMORY_MS);
  if (stale || until <= Date.now()) return;
  memory.delete(id);
  memory.set(id, { until, data });
  if (memory.size > MEMORY_SIZE) memory.delete(memory.keys().next().value);
};

const inFlight = new Map(); // `${airline}:${key}` → the request on its way in this instance

// `request()`'s JSON for `key`, through the guard. fresh: seconds an answer is used without asking again; keep:
// seconds it is kept, to serve it when the airline fails or blocks us; perSecond: the airline's requests a second.
// `request` throws `responseError` on a failed answer, so a block is noticed. The answer is shared: never change it.
export const airlineJson = async (airline, key, request, options) => {
  const id = `${airline}:${key}`;
  const known = remembered(id);
  if (known !== undefined) return known;
  if (!inFlight.has(id))
    inFlight.set(
      id,
      load(airline, key, request, options)
        .then((answer) => {
          remember(id, answer, options.fresh);
          return answer.data;
        })
        .finally(() => inFlight.delete(id))
    );
  return inFlight.get(id);
};
