"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { UNMEASURED_PATH } from "@/constants/analytics";

// Drops whatever happens on the team's pages (page views, events and speed figures alike)
const leaveOutTeamPages = (event) => (UNMEASURED_PATH.test(new URL(event.url).pathname) ? null : event);

// Vercel's page views, the events of utils/analytics `track`, and the real speed of each page (Core Web Vitals)
const VercelAnalytics = () => (
  <>
    <Analytics beforeSend={leaveOutTeamPages} />
    <SpeedInsights beforeSend={leaveOutTeamPages} />
  </>
);

export default VercelAnalytics;
