"use client";

import FadeImage from "@/components/shared/FadeImage";
import PhotoCredit from "@/components/shared/PhotoCredit";
import { useI18n } from "@/context/i18n";
import { useTripPhoto } from "@/hooks/useTripPhoto";

// The destination photo behind the header, blended into its dark background: on the right on desktop
// (fading to the left and down, so the text stays on plain dark), dimmed behind the text on phones.
// In the dark theme it is also darkened, so the white text and the buttons on top of it always read.
// The © in the corner credits it, as its licence requires. A trip planned by hand shows its first town.
const TripBackdrop = ({ trip }) => {
  const { texts } = useI18n();
  const photo = useTripPhoto(trip);
  if (!photo) return null;
  return (
    <>
      {/* Two nested masks (fade to the bottom, then to the left) instead of one with two layers. The photo fades
          in when it opens */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-35 mask-[linear-gradient(to_bottom,black_45%,transparent)] duration-700 animate-in fade-in motion-reduce:animate-none md:left-auto md:w-[68%] md:opacity-90 md:mask-[linear-gradient(to_bottom,black_60%,transparent)]"
      >
        <FadeImage
          src={photo.src}
          alt=""
          className="size-full object-cover dark:brightness-75 md:mask-[linear-gradient(to_right,transparent,rgb(0_0_0/0.15)_18%,rgb(0_0_0/0.6)_40%,black_62%)]"
        />
        {/* Fading into the background at the top, where the theme, language and ⋯ buttons sit over the photo */}
        <div className="absolute inset-x-0 top-0 h-2/5 bg-linear-to-b from-background/85 to-transparent" />
      </div>
      <PhotoCredit page={photo.page} text={texts.deals.photoBy(photo.author, photo.license)} className="right-4 bottom-4 bg-black/30 sm:right-6" />
    </>
  );
};

export default TripBackdrop;
