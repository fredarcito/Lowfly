"use client";

import SiteFooter from "@/components/layout/SiteFooter";
import TopBar from "@/components/layout/TopBar";
import { cn } from "@/utils/cn";

// The frame of "My trips" (and the legal and route pages): the header with the top bar, the content, the footer.
// With `hero` (a trip's photo header) the header grows to hold it, on the page background so the photo
// fades straight into the content below.
const TripsPage = ({ hero, children }) => {
  // At least as tall as the screen, the content stretching: on a short page the footer still sits at the bottom
  return (
    <div className="flex min-h-dvh flex-col">
      <header
        className={cn(
          "relative isolate overflow-hidden px-4 pt-[calc(2.5rem+env(safe-area-inset-top,0px))] text-hero-foreground sm:px-6",
          hero ? "bg-background pb-6 sm:pb-8" : "bg-(image:--hero) pb-8"
        )}
      >
        <TopBar className="mx-auto max-w-5xl" />
        {hero && <div className="mx-auto mt-6 max-w-5xl sm:mt-8">{hero}</div>}
      </header>
      <main className="mx-auto grid w-full max-w-[calc(64rem+3rem)] flex-1 auto-rows-max grid-cols-1 gap-6 px-4 pt-2 pb-[calc(3rem+env(safe-area-inset-bottom,0px))] sm:px-6">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
};

export default TripsPage;
