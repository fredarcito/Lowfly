"use client";

import { BedDouble, CalendarDays, Landmark, TramFront } from "lucide-react";
import IntroCard from "@/components/shared/IntroCard";
import { guideTexts } from "@/components/guides/data/texts";
import { ENTER_RISE, riseDelay } from "@/constants/motion";

// What to know before the days: the city, where to stay, getting around and when to go (written with the guide),
// each card folded to a few lines on phones (IntroCard)
const GuideIntro = ({ lang, city, intro }) => {
  const texts = guideTexts(lang).intro;
  const sections = [
    { icon: Landmark, title: texts.about(city), text: intro.about },
    { icon: BedDouble, title: texts.stay, text: intro.stay },
    { icon: TramFront, title: texts.gettingAround, text: intro.gettingAround },
    { icon: CalendarDays, title: texts.bestTime, text: intro.bestTime },
  ];
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {sections.map((section, index) => (
        <IntroCard key={section.title} {...section} className={ENTER_RISE} style={riseDelay(index)} />
      ))}
    </section>
  );
};

export default GuideIntro;
