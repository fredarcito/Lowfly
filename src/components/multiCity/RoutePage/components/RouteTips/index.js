"use client";

import { CalendarDays, TrainFront } from "lucide-react";
import IntroCard from "@/components/shared/IntroCard";
import { routePageTexts } from "@/components/multiCity/data/texts";

// Getting between a route's towns and when to go, as a guide's cards (IntroCard: folded to a few lines on phones)
const RouteTips = ({ lang, gettingAround, bestTime }) => {
  const texts = routePageTexts(lang);
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <IntroCard icon={TrainFront} title={texts.gettingAround} text={gettingAround} />
      <IntroCard icon={CalendarDays} title={texts.bestTime} text={bestTime} />
    </section>
  );
};

export default RouteTips;
