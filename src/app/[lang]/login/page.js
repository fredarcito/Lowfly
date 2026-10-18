import { Suspense } from "react";
import { LoginForm } from "@/components/account/LoginForm";
import TripsPage from "@/components/trips/TripsPage";
import { I18nProvider } from "@/providers/I18nProvider";
import { APP_NAME, getDictionary } from "@/i18n";
import { ROUTES } from "@/constants/routes";
import { PRIVATE_PAGE, alternatesOf, openGraphOf } from "@/utils/metadata";

export const generateMetadata = async ({ params }) => {
  const { lang } = await params;
  const texts = getDictionary(lang);
  // "Entrar · Lowfly": the page's own heading ("Entra en Lowfly") already says the name
  const [title, description] = [`${texts.account.signIn} · ${APP_NAME}`, texts.account.subtitle];
  return {
    title,
    description,
    robots: PRIVATE_PAGE,
    alternates: alternatesOf(lang, (locale) => ROUTES.login(locale)),
    openGraph: openGraphOf(lang, { title, description, url: ROUTES.login(lang) }),
  };
};

// Signing in (Google or a link by email). Suspense: the form reads ?next= and ?error= from the URL.
const LoginPage = async ({ params }) => {
  const { lang } = await params;
  return (
    <I18nProvider lang={lang}>
      <TripsPage>
        <div className="grid justify-items-center py-4 sm:py-8">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </TripsPage>
    </I18nProvider>
  );
};

export default LoginPage;
