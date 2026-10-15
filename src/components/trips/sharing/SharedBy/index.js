"use client";

import { useI18n } from "@/context/i18n";

// "Fredy shared their trip with you", with their picture (or initial); on a glass pill over the photo from
// tablets up (phones keep it light: just the picture and the line)
const SharedBy = ({ owner }) => {
  const { texts } = useI18n();
  return (
    <p className="flex w-fit items-center gap-2.5 rounded-full text-sm font-medium text-hero-foreground sm:bg-hero-chip sm:py-1 sm:pr-4 sm:pl-1 sm:backdrop-blur-sm">
      <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-primary text-primary-foreground">
        {owner.avatar ? (
          <img src={owner.avatar} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
        ) : (
          <span className="font-heading text-sm font-bold uppercase">{owner.name?.[0] ?? "✈"}</span>
        )}
      </span>
      {texts.share.sharedBy(owner.name)}
    </p>
  );
};

export default SharedBy;
