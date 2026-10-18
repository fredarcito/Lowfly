import LegalDocument from "@/components/legal/LegalDocument";
import TripsPage from "@/components/trips/TripsPage";
import { I18nProvider } from "@/providers/I18nProvider";
import { APP_NAME } from "@/i18n";
import { PRIVACY } from "@/constants/privacy";
import { TERMS, TERMS_UPDATED } from "@/constants/terms";
import { ROUTES } from "@/constants/routes";
import { alternatesOf, openGraphOf } from "@/utils/metadata";

export const generateMetadata = async ({ params }) => {
  const { lang } = await params;
  const [title, description] = [`${TERMS[lang].title} · ${APP_NAME}`, TERMS[lang].intro];
  return { title, description, alternates: alternatesOf(lang, ROUTES.terms), openGraph: openGraphOf(lang, { title, description, url: ROUTES.terms(lang) }) };
};

// The terms of use: what Lowfly is (no tickets sold), what its prices and AI itineraries are worth, fair use
const TermsPage = async ({ params }) => {
  const { lang } = await params;
  return (
    <I18nProvider lang={lang}>
      <TripsPage>
        <LegalDocument lang={lang} doc={TERMS[lang]} updatedDay={TERMS_UPDATED} related={{ href: ROUTES.privacy(lang), label: PRIVACY[lang].title }} />
      </TripsPage>
    </I18nProvider>
  );
};

export default TermsPage;
