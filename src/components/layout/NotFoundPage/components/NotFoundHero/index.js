"use client";

import Link from "next/link";
import { Luggage, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import PhotoBackdrop from "@/components/shared/PhotoBackdrop";
import { useI18n } from "@/context/i18n";
import { ROUTES } from "@/constants/routes";
import { fallbackPhoto } from "@/utils/fallbackPhoto";

// The 404 told kindly over a travel photo, with the ways back: search flights, my trips
const NotFoundHero = () => {
  const { lang, texts } = useI18n();
  const words = texts.notFound;
  return (
    <div className="grid gap-4 pt-6 pb-10 sm:pt-12 sm:pb-16">
      <PhotoBackdrop image={fallbackPhoto("404")} photo={null} />
      <p className="text-sm font-semibold tracking-widest text-hero-muted uppercase">{words.eyebrow}</p>
      <h1 className="max-w-[14ch] font-heading text-4xl leading-[1.05] font-extrabold tracking-tight drop-shadow-sm sm:text-6xl">{words.title}</h1>
      <p className="max-w-[48ch] text-hero-muted sm:text-lg">{words.text}</p>
      <div className="mt-2 flex flex-wrap gap-3">
        <Button asChild className="h-12 px-6 text-base font-bold">
          <Link href={ROUTES.home(lang)}>
            <Search /> {words.search}
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12 bg-hero-glass px-6 text-base font-bold backdrop-blur-md">
          <Link href={ROUTES.trips(lang)}>
            <Luggage /> {words.trips}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFoundHero;
