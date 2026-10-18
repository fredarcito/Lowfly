import Link from "next/link";
import { ArrowRight, Map } from "lucide-react";
import { guideTexts } from "@/components/guides/data/texts";
import { ROUTES } from "@/constants/routes";

// "What to see in Rome": a city's guide, from a page about flying there (a route's page). `guide`: server/cityGuides.
const GuideLink = ({ lang, guide }) => {
  const texts = guideTexts(lang).routeLink;
  return (
    <Link
      href={ROUTES.guide(lang, guide.slug)}
      className="group flex items-center gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10 transition hover:ring-primary/50 sm:p-6"
    >
      <Map className="size-6 shrink-0 text-primary" />
      <span className="grid flex-1 gap-0.5">
        <span className="font-heading text-lg font-bold">{texts.title(guide.city)}</span>
        <span className="text-sm text-muted-foreground">{texts.text(guide.city, guide.dayCount)}</span>
      </span>
      <ArrowRight className="size-5 shrink-0 text-primary transition group-hover:translate-x-1" />
    </Link>
  );
};

export default GuideLink;
