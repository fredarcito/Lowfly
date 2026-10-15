"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { ROUTES } from "@/constants/routes";

// "+ Explore more flights" under the trip list: back to the search
const ExploreMoreLink = () => {
  const { lang, texts } = useI18n();
  return (
    <Link
      href={ROUTES.home(lang)}
      className="flex w-fit items-center gap-3 rounded-full py-1 pr-3 font-medium text-primary-ink hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <span className="grid size-9 place-items-center rounded-full ring-1 ring-primary-ink/60">
        <Plus className="size-4" />
      </span>
      {texts.trips.exploreMore}
    </Link>
  );
};

export default ExploreMoreLink;
