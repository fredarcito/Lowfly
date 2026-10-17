// Google Analytics 4: only where NEXT_PUBLIC_GA_ID is set (production, on Vercel), so this machine and the tests
// send nothing
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// Pages left out of the figures: the team's own (/es/admin…)
export const UNMEASURED_PATH = /^\/[a-z]{2}\/admin(\/|$)/;
