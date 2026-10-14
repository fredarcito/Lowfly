// A simple per-visitor limit for expensive calls (the AI). It lives in this server instance's memory,
// so it is a first barrier, not a guarantee: on Vercel each instance keeps its own count.
const windows = new Map(); // key → timestamps of recent calls

// true if `key` may make another call: at most `limit` calls in the last `windowMs`
export function allow(key, limit, windowMs) {
  const now = Date.now();
  const recent = (windows.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= limit) {
    windows.set(key, recent);
    return false;
  }
  recent.push(now);
  windows.set(key, recent);
  // Keep the map small
  if (windows.size > 5000) for (const [stale, times] of windows) if (!times.some((time) => now - time < windowMs)) windows.delete(stale);
  return true;
}
