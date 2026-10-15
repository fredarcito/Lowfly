import TripsPage from "@/components/trips/TripsPage";
import { I18nProvider } from "@/providers/I18nProvider";
import { APP_NAME } from "@/i18n";
import { LOCALE_TAGS } from "@/i18n/config";
import { PRIVACY, PRIVACY_CONTACT, PRIVACY_UPDATED } from "@/constants/privacy";

export const generateMetadata = async ({ params }) => {
  const { lang } = await params;
  return { title: `${PRIVACY[lang].title} · ${APP_NAME}`, description: PRIVACY[lang].intro };
};

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

// The privacy policy (Google asks for it to publish sign-in with Google; the app stores need it too)
const PrivacyPage = async ({ params }) => {
  const { lang } = await params;
  const policy = PRIVACY[lang];
  const updated = new Intl.DateTimeFormat(LOCALE_TAGS[lang], { dateStyle: "long" }).format(new Date(`${PRIVACY_UPDATED}T12:00:00`));
  return (
    <I18nProvider lang={lang}>
      <TripsPage>
        <article className="grid max-w-[70ch] gap-8 py-4 leading-relaxed">
          <header className="grid gap-3">
            <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{policy.title}</h1>
            <p className="text-sm text-muted-foreground">{policy.updated(updated)}</p>
            <p className="text-lg text-muted-foreground">{policy.intro}</p>
          </header>
          {policy.sections.map((section) => (
            <section key={section.title} className="grid gap-3">
              <h2 className="font-heading text-xl font-bold">{section.title}</h2>
              {section.body.map((block, index) => (
                <Block key={index} block={block} />
              ))}
            </section>
          ))}
          <a href={`mailto:${PRIVACY_CONTACT}`} className="-mt-5 w-fit font-medium text-primary-ink underline underline-offset-4">
            {PRIVACY_CONTACT}
          </a>
        </article>
      </TripsPage>
    </I18nProvider>
  );
};

export default PrivacyPage;
