"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PhotoCredit from "@/components/shared/PhotoCredit";
import ShareButton from "@/components/shared/ShareButton";
import { guideTexts } from "@/components/guides/data/texts";
import { useI18n } from "@/context/i18n";
import { ROUTES } from "@/constants/routes";
import { fallbackPhoto } from "@/utils/fallbackPhoto";

// One guide on the guides' page: its photo (with its credit and "Share"), country and length, title, what it covers
// and "See guide". The whole card opens it (its title's link stretched over it); the © and "Share" stay their own,
// above it.
// `photo`: server/photos, or null for a generic one.
const GuideCard = ({ guide, photo }) => {
  const { lang, texts: appTexts } = useI18n();
  const texts = guideTexts(lang);
  const image = photo ?? fallbackPhoto(guide.codes[0]);
  return (
    <article className="group relative grid h-full grid-rows-[auto_1fr] overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition hover:ring-primary/50">
      <div className="relative aspect-16/9 overflow-hidden bg-muted">
        <img
          src={image.src}
          srcSet={image.srcSet}
          sizes="(min-width: 1024px) 340px, (min-width: 640px) 50vw, 100vw"
          alt={photo ? texts.photoAlt(guide.city) : ""}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
        />
        {/* Darker at the top, so "Share" reads over any photo, a white sky too */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-2/5 bg-linear-to-b from-black/55 to-transparent" />
        {photo && <PhotoCredit page={photo.page} text={appTexts.deals.photoBy(photo.author, photo.license)} className="right-2 bottom-2 z-20" />}
        <ShareButton
          path={ROUTES.guide(lang, guide.slug)}
          title={texts.share.title}
          description={texts.share.text}
          message={texts.title(guide.city, guide.dayCount)}
          analytics={{ content_type: "guide", item_id: guide.id }}
          className="absolute top-3 right-3 z-20 h-9 bg-black/45 px-3.5 text-white hover:bg-black/65 hover:text-white dark:hover:bg-black/65"
        />
      </div>
      <div className="grid content-start gap-2 p-5">
        <p className="text-sm text-muted-foreground">
          {guide.country} · {texts.list.days(guide.dayCount)}
        </p>
        <h3 className="font-heading text-xl font-bold">
          <Link href={ROUTES.guide(lang, guide.slug)} className="after:absolute after:inset-0 after:z-10">
            {texts.title(guide.city, guide.dayCount)}
          </Link>
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{guide.intro.summary}</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-primary-ink">
          {texts.list.see} <ArrowRight className="size-4 transition group-hover:translate-x-1" />
        </p>
      </div>
    </article>
  );
};

export default GuideCard;
