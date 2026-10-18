import { Check, Sparkles } from "lucide-react";
import TailorLink from "@/components/guides/GuidePage/components/TailorLink";
import { guideTexts } from "@/components/guides/data/texts";

// The end of a guide: what the reader's own itinerary brings that the guide does not, and "Create my itinerary"
const TailorCard = ({ lang, city, href, guide }) => {
  const texts = guideTexts(lang).card;
  return (
    <section className="grid gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <div className="flex gap-3">
        <Sparkles className="mt-1 size-6 shrink-0 text-primary" />
        <div className="grid gap-0.5">
          <h2 className="font-heading text-xl font-bold sm:text-2xl">{texts.title(city)}</h2>
          <p className="text-sm text-muted-foreground">{texts.subtitle}</p>
        </div>
      </div>
      <ul className="grid gap-2 text-sm sm:grid-cols-2">
        {texts.points.map((point) => (
          <li key={point} className="flex items-center gap-2.5">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-3" strokeWidth={3} />
            </span>
            {point}
          </li>
        ))}
      </ul>
      <TailorLink href={href} guide={guide} spot="card" className="h-11 w-fit px-6 font-bold max-sm:w-full">
        {texts.button}
      </TailorLink>
    </section>
  );
};

export default TailorCard;
