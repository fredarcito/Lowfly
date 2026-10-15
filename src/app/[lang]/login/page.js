import { Suspense } from "react";
import { LoginForm } from "@/components/account/LoginForm";
import TripsPage from "@/components/trips/TripsPage";
import { I18nProvider } from "@/providers/I18nProvider";
import { APP_NAME, getDictionary } from "@/i18n";

export const generateMetadata = async ({ params }) => {
  const { lang } = await params;
  const t = getDictionary(lang);
  return { title: `${t.account.title} · ${APP_NAME}`, description: t.account.subtitle };
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
