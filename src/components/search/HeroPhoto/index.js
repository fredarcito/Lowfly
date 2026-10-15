"use client";

import PhotoCredit from "@/components/shared/PhotoCredit";
import { useBackgroundLoaded } from "@/components/search/HeroPhoto/hooks/useBackgroundLoaded";
import { useI18n } from "@/context/i18n";
import { cn } from "@/utils/cn";

const PHOTOS = {
  day: { page: "https://commons.wikimedia.org/wiki/File:Positano_panorama.jpg", credit: "photoCreditDay", className: "grid dark:hidden" },
  night: { page: "https://commons.wikimedia.org/wiki/File:Positano_Sunset.JPG", credit: "photoCreditNight", className: "hidden dark:grid" },
};

// The © sits above the search card
const CREDIT_PLACE = "right-4 bottom-[6.25rem] bg-black/30 sm:right-6";

// Positano (by day in the light theme, at dusk in the dark one; see .hero-photo in globals.css), blended into
// the header colour: on the right on desktop, dimmed behind the text on mobile. It fades in once loaded. The ©
// credits it.
const HeroPhoto = () => {
  const { texts } = useI18n();
  const photo = useBackgroundLoaded();
  return (
    <>
      {/* Two nested masks (fade to the bottom, then to the left) instead of one with two layers */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-35 mask-[linear-gradient(to_bottom,black_40%,transparent)] md:left-auto md:w-[72%] md:opacity-95 md:mask-[linear-gradient(to_bottom,black_55%,transparent)]"
      >
        <div
          ref={photo.ref}
          className={cn(
            "hero-photo size-full transition-opacity duration-700 ease-out motion-reduce:transition-none md:mask-[linear-gradient(to_right,transparent,rgb(0_0_0/0.04)_15%,rgb(0_0_0/0.18)_30%,rgb(0_0_0/0.5)_45%,rgb(0_0_0/0.85)_58%,black_68%)]",
            photo.loaded ? "opacity-100" : "opacity-0"
          )}
        />
      </div>
      {Object.entries(PHOTOS).map(([name, photo]) => (
        <PhotoCredit key={name} page={photo.page} text={texts.header[photo.credit]} className={cn(CREDIT_PLACE, photo.className)} />
      ))}
    </>
  );
};

export default HeroPhoto;
