import { adminTexts } from "@/components/admin/data/texts";
import { adminFormat } from "@/components/admin/data/format";

// The AI in the period, side by side: what an itinerary cost on average, how many were made by Claude (when Gemini
// was busy), and how the cost is worked out
const AiUsage = ({ itineraries, lang }) => {
  const texts = adminTexts(lang).dashboard;
  const formats = adminFormat(lang);
  return (
    <section className="grid gap-5 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <h2 className="font-heading text-lg font-bold">{texts.ai}</h2>
      <dl className="grid gap-5 md:grid-cols-3 md:divide-x">
        <div className="grid content-start gap-1 md:pr-6">
          <dt className="text-sm text-muted-foreground">{texts.costPerItinerary}</dt>
          <dd className="font-heading text-3xl font-extrabold tracking-tight tabular-nums">{formats.money(itineraries.costPerItinerary)}</dd>
        </div>
        <div className="grid content-start gap-1 md:px-6">
          <dt className="text-sm text-muted-foreground">{texts.claudeShare}</dt>
          <dd className="font-heading text-3xl font-extrabold tracking-tight tabular-nums">{formats.percent(itineraries.claudeShare)}</dd>
          <dd className="text-xs text-muted-foreground">{texts.claudeShareHint}</dd>
        </div>
        <div className="grid content-start gap-1 md:pl-6">
          <dt className="text-sm text-muted-foreground">{texts.howTitle}</dt>
          <dd className="text-sm">{texts.how}</dd>
        </div>
      </dl>
    </section>
  );
};

export default AiUsage;
