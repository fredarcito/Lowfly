import Link from "next/link";
import { LOCALE_TAGS } from "@/i18n/config";
import { CONTACT_EMAIL } from "@/constants/privacy";

// A paragraph, or a bulleted list when it is an array
const Block = ({ block }) =>
  Array.isArray(block) ? (
    <ul className="grid list-disc gap-1.5 pl-5 marker:text-muted-foreground">
      {block.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  ) : (
    <p>{block}</p>
  );

// A legal page (privacy policy, terms of use): title, date, intro, sections, the contact email and a link to
// the other page. doc: { title, intro, updated(date), sections: [{ title, body }] } (constants/privacy, terms)
export const LegalDocument = ({ lang, doc, updatedDay, related }) => {
  const updated = new Intl.DateTimeFormat(LOCALE_TAGS[lang], { dateStyle: "long" }).format(new Date(`${updatedDay}T12:00:00`));
  return (
    <article className="grid max-w-[70ch] gap-8 py-4 leading-relaxed">
      <header className="grid gap-3">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{doc.title}</h1>
        <p className="text-sm text-muted-foreground">{doc.updated(updated)}</p>
        <p className="text-lg text-muted-foreground">{doc.intro}</p>
      </header>
      {doc.sections.map((section) => (
        <section key={section.title} className="grid gap-3">
          <h2 className="font-heading text-xl font-bold">{section.title}</h2>
          {section.body.map((block, index) => (
            <Block key={index} block={block} />
          ))}
        </section>
      ))}
      <a href={`mailto:${CONTACT_EMAIL}`} className="-mt-5 w-fit font-medium text-primary-ink underline underline-offset-4">
        {CONTACT_EMAIL}
      </a>
      <Link href={related.href} className="w-fit border-t pt-4 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
        {related.label}
      </Link>
    </article>
  );
};
