// Upstash Redis (Vercel Marketplace: lowfly-redis), shared by every server instance. Only called from the server.
// Without its keys (KV_REST_API_URL and KV_REST_API_TOKEN, from `vercel env pull`) it is null, and the callers go
// on without it.
import { Redis } from "@upstash/redis";

let client;

export const redis = () => {
  if (client === undefined) {
    const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
    client = url && token ? new Redis({ url, token }) : null;
  }
  return client;
};

// Every environment (production, preview, development) shares the database: its keys go under its name, so a test
// run never touches production's
export const redisKey = (...parts) => [process.env.VERCEL_ENV ?? "development", ...parts].join(":");

// A deploy (production, previews), not the dev server: what spends the database's free commands on every request
// (the airline guard, the search limit) uses Redis only there
export const deployed = () => Boolean(process.env.VERCEL_ENV) && process.env.VERCEL_ENV !== "development";
