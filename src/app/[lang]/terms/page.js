import LegalDocument from "@/components/legal/LegalDocument";
import TripsPage from "@/components/trips/TripsPage";
import { I18nProvider } from "@/providers/I18nProvider";
import { APP_NAME } from "@/i18n";
import { PRIVACY } from "@/constants/privacy";
import { TERMS, TERMS_UPDATED } from "@/constants/terms";
import { ROUTES } from "@/constants/routes";
import { alternatesOf } from "@/utils/metadata";

export const generateMetadata = async ({ params }) => {
  const { lang } = await params;
  return { title: `${TERMS[lang].title} · ${APP_NAME}`, description: TERMS[lang].intro, alternates: alternatesOf(lang, ROUTES.terms) };
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
