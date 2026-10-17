"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { GA_ID, UNMEASURED_PATH } from "@/constants/analytics";
import { bookingOf, track } from "@/utils/analytics";

// Google's tag set up: page views (Analytics counts the app's own page changes too), except on the team's pages
// (Analytics' own switch, window["ga-disable-<id>"]). gtag needs `arguments`, so it is a plain function.
const setup = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;window["ga-disable-${GA_ID}"]=${UNMEASURED_PATH}.test(location.pathname);gtag("js",new Date());gtag("config","${GA_ID}");`;

// Google Analytics on every page (constants/analytics: only in production), loaded once the page is up so it never
// slows it down. Every click on a link to an airline's site (any "Book" button, wherever it is) is a book_click
// with the airline and route.
const Analytics = () => {
  const pathname = usePathname();

  useEffect(() => {
    window[`ga-disable-${GA_ID}`] = UNMEASURED_PATH.test(pathname);
  }, [pathname]);

  useEffect(() => {
    const onClick = (event) => {
      const booking = bookingOf(event.target.closest?.("a[href]")?.href ?? "");
      if (booking) track("book_click", booking);
    };
    // Middle-click (a new tab) too
    document.addEventListener("click", onClick, true);
    document.addEventListener("auxclick", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("auxclick", onClick, true);
    };
  }, []);

  return (
    <>
      <Script id="google-analytics" strategy="afterInteractive">
        {setup}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
    </>
  );
};

export default Analytics;
