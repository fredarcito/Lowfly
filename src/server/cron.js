// Vercel Cron calls the cron routes (vercel.json) with CRON_SECRET as a bearer token; nobody else may
export const isCronRequest = (request) =>
  Boolean(process.env.CRON_SECRET) && request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
