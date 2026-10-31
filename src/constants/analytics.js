// Google Analytics 4: only where NEXT_PUBLIC_GA_ID is set (production, on Vercel), so this machine and the tests
// send nothing
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// Vercel Web Analytics and Speed Insights: only on the production deployment (Vercel sets NEXT_PUBLIC_VERCEL_ENV),
// never on previews, this machine or the tests. Running next to Google's for now, to compare them and keep one.
export const VERCEL_ANALYTICS = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

// Pages left out of the figures: the team's own (/es/admin…)
export const UNMEASURED_PATH = /^\/[a-z]{2}\/admin(\/|$)/;
