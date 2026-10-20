// Questions and answers in a card (a city guide's, a route's), every answer in view: on the server, so search engines
// read them (the page also gives them as FAQPage). `id`: the section's, for its title; `faq`: [{ id?, question,
// answer }].
const FaqSection = ({ id, title, faq }) => (
  <section aria-labelledby={id} className="grid gap-5 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
    <h2 id={id} className="font-heading text-xl font-bold">
      {title}
    </h2>
    <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
      {faq.map((entry) => (
        <div key={entry.id ?? entry.question} className="grid content-start gap-1.5">
          <h3 className="font-semibold">{entry.question}</h3>
          <p className="max-w-[65ch] text-sm leading-relaxed text-muted-foreground">{entry.answer}</p>
        </div>
      ))}
    </div>
  </section>
);

export default FaqSection;
