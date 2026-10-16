// Travelpayouts Drive: Travelpayouts' script, which verifies the site for its partner programmes (Booking.com,
// Trip.com…). Only loaded with TRAVELPAYOUTS_DRIVE=on (Vercel environment variable, read at build time), so it can
// be switched off without touching the code. Its own features (changing links, adding widgets and offers) are meant
// to stay off in the Travelpayouts dashboard: what the app shows is ours. Never on the admin pages.
export const TRAVELPAYOUTS_DRIVE = process.env.TRAVELPAYOUTS_DRIVE === "on";

export const DRIVE_SCRIPT = `(function () {
  if (/^\\/[a-z]{2}\\/admin(\\/|$)/.test(location.pathname)) return;
  var script = document.createElement("script");
  script.async = 1;
  script.setAttribute("data-cmp-ab", "2");
  script.src = "https://tpembars.com/NTg2NTU4.js?t=586558";
  document.head.appendChild(script);
})();`;
