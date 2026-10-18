import { guideTexts } from "@/components/guides/data/texts";

// What people ask about the city, answered with the guide (utils/guideFaq), every answer in view: on the server, so
// search engines read them (the page also gives them as FAQPage)
const GuideFaq = ({ lang, city, faq }) => {
  const texts = guideTexts(lang).faq;
  return (
    <section aria-labelledby="guide-faq-title" className="grid gap-5 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <h2 id="guide-faq-title" className="font-heading text-xl font-bold">
        {texts.title(city)}
      </h2>
      <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
        {faq.map((entry) => (
          <div key={entry.id} className="grid content-start gap-1.5">
            <h3 className="font-semibold">{entry.question}</h3>
            <p className="max-w-[65ch] text-sm leading-relaxed text-muted-foreground">{entry.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GuideFaq;
