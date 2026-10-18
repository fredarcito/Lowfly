import { CalendarDays } from "lucide-react";
import PhotoBackdrop from "@/components/shared/PhotoBackdrop";
import ShareButton from "@/components/shared/ShareButton";
import TailorLink from "@/components/guides/GuidePage/components/TailorLink";
import { guideTexts } from "@/components/guides/data/texts";
import { fallbackPhoto } from "@/utils/fallbackPhoto";
import { ROUTES } from "@/constants/routes";

// The top of a guide, over the city's photo: "Qué ver en Roma en 3 días", what it covers, the first way to make
// one's own and "Share". `photo`: the city's (server/photos), or null for a generic one.
const GuideHero = ({ lang, guide, photo, href }) => {
  const texts = guideTexts(lang);
  return (
    <div className="grid gap-4 pt-4 pb-2 sm:pt-2 sm:pb-6">
      <PhotoBackdrop image={photo ?? fallbackPhoto(guide.codes[0])} photo={photo} alt={texts.photoAlt(guide.city)} />
      <p className="flex items-center gap-1.5 text-sm font-semibold tracking-wide text-hero-muted uppercase">
        <CalendarDays className="size-4" /> {texts.kicker(guide.dayCount)}
      </p>
      <h1 className="max-w-[16ch] font-heading text-4xl leading-[1.05] font-extrabold tracking-tight drop-shadow-sm sm:text-6xl">
        {texts.title(guide.city, guide.dayCount)}
      </h1>
      <p className="max-w-[60ch] text-hero-muted sm:text-lg">{guide.intro.summary}</p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <TailorLink href={href} guide={guide.slug} spot="hero" className="h-12 w-fit px-6 text-base font-bold">
          {texts.prompts.hero.button}
        </TailorLink>
        <ShareButton
          path={ROUTES.guide(lang, guide.slug)}
          title={texts.share.title}
          description={texts.share.text}
          message={texts.title(guide.city, guide.dayCount)}
          analytics={{ content_type: "guide", item_id: guide.slug }}
          className="h-12 px-5 text-base"
        />
      </div>
    </div>
  );
};

export default GuideHero;
