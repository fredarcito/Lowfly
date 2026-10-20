// Daily counters for the admin's "Uso" page (server/admin/usage): the searches by kind and how they ended, and how the
// airlines answer (from the cache, asked, blocked…). One Redis hash per day (`metrics:2026-10-20`, kept
// KEEP_DAYS), field → count. Counts are gathered in this instance and sent together once the request has answered
// (Next's `after`), so counting never slows a search down nor costs a Redis call each. Without Redis, nothing is
// counted. Only called from the server.
import { after } from "next/server";
import { redis, redisKey } from "@/server/redis";

const KEEP_DAYS = 120;

const pending = new Map(); // field → count not sent yet
let scheduled = false;

// Today's key (UTC days, as the admin's other figures)
export const metricsKey = (day = new Date().toISOString().slice(0, 10)) => redisKey("metrics", day);

const flush = async () => {
  scheduled = false;
  const store = redis();
  if (!store || !pending.size) return;
  const counts = [...pending];
  pending.clear();
  const key = metricsKey();
  try {
    const batch = store.pipeline();
    for (const [field, count] of counts) batch.hincrby(key, field, count);
    batch.expire(key, KEEP_DAYS * 86_400);
    await batch.exec();
  } catch (error) {
    console.error("Metrics", error.message);
  }
};

// Adds `count` to `field` today ("search:multiCity", "airline:wizz:blocked"…)
export const countMetric = (field, count = 1) => {
  if (!redis()) return;
  pending.set(field, (pending.get(field) ?? 0) + count);
  if (scheduled) return;
  scheduled = true;
  // After the answer, within the request; outside one (a script), at once
  try {
    after(flush);
  } catch {
    flush();
  }
};
