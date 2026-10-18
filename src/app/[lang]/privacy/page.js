import LegalDocument from "@/components/legal/LegalDocument";
import TripsPage from "@/components/trips/TripsPage";
import { I18nProvider } from "@/providers/I18nProvider";
import { APP_NAME } from "@/i18n";
import { PRIVACY, PRIVACY_UPDATED } from "@/constants/privacy";
import { TERMS } from "@/constants/terms";
import { ROUTES } from "@/constants/routes";
import { alternatesOf, openGraphOf } from "@/utils/metadata";

export const generateMetadata = async ({ params }) => {
  const { lang } = await params;
  const [title, description] = [`${PRIVACY[lang].title} · ${APP_NAME}`, PRIVACY[lang].intro];
  return { title, description, alternates: alternatesOf(lang, ROUTES.privacy), openGraph: openGraphOf(lang, { title, description, url: ROUTES.privacy(lang) }) };
};

// The privacy policy (Google asks for it to publish sign-in with Google; the app stores need it too)
const PrivacyPage = async ({ params }) => {
  const { lang } = await params;
  return (
    <I18nProvider lang={lang}>
      <TripsPage>
        <LegalDocument lang={lang} doc={PRIVACY[lang]} updatedDay={PRIVACY_UPDATED} related={{ href: ROUTES.terms(lang), label: TERMS[lang].title }} />
      </TripsPage>
    </I18nProvider>
  );
};

export default PrivacyPage;
