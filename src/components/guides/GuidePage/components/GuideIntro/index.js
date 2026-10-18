import { BedDouble, CalendarDays, Landmark, TramFront } from "lucide-react";
import { guideTexts } from "@/components/guides/data/texts";
import { ENTER_RISE, riseDelay } from "@/constants/motion";
import { cn } from "@/utils/cn";

// What to know before the days: the city, where to stay, getting around and when to go (written with the guide)
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
      {sections.map(({ icon: Icon, title, text }, index) => (
        <div key={title} className={cn("grid content-start gap-1.5 rounded-xl bg-card p-5 ring-1 ring-foreground/10", ENTER_RISE)} style={riseDelay(index)}>
          <h2 className="flex items-center gap-2 font-heading font-bold">
            <Icon className="size-4.5 text-primary" /> {title}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
        </div>
      ))}
    </section>
  );
};

export default GuideIntro;
