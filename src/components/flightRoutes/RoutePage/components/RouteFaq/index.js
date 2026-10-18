import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { routeTexts } from "@/components/flightRoutes/data/texts";

// What people ask about the route, answered with its own figures (utils/routeFaq), every answer in view: on the
// server, so search engines read them (the page also gives them as FAQPage)
const RouteFaq = ({ lang, route, faq }) => {
  const texts = routeTexts(lang).faq;
  return (
    <section className="grid gap-5 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <h2 className="font-heading text-xl font-bold">{texts.title(route.origin.city, route.city)}</h2>
      <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
        {faq.map((entry) => (
          <div key={entry.id} className="grid content-start gap-1.5">
            <h3 className="font-semibold">{entry.question}</h3>
            <p className="max-w-[65ch] text-sm leading-relaxed text-muted-foreground">{entry.answer}</p>
            {entry.link && (
              <Link href={entry.link.href} className="flex w-fit items-center gap-1.5 text-sm font-semibold text-primary-ink hover:underline">
                {entry.link.label} <ArrowRight className="size-4" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default RouteFaq;
