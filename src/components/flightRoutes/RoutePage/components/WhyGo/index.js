import { ExternalLink } from "lucide-react";
import { routeTexts } from "@/components/flightRoutes/data/texts";

// Why go: the destination's guide (a sentence, its highlights as plain text joined by dots, as on a trip's header,
// and its source). `guide`: server/guides { text, tags, source }.
const WhyGo = ({ lang, city, guide }) => {
  const texts = routeTexts(lang);
  return (
    <section className="grid content-start gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <h2 className="font-heading text-xl font-bold">{texts.whyGo(city)}</h2>
      <p className="max-w-[65ch] leading-relaxed text-muted-foreground">
        {guide.text}{" "}
        <a href={guide.source} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs underline underline-offset-4">
          {texts.source} <ExternalLink className="size-3" />
        </a>
      </p>
      {guide.tags?.length > 0 && (
        <ul className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          {guide.tags.map((tag, index) => (
            <li key={tag} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden className="text-muted-foreground">·</span>}
              {tag}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default WhyGo;
