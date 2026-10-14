import { Suspense } from "react";
import TripsApp from "@/components/TripsApp";
import { I18nProvider } from "@/components/I18nProvider";
import { APP_NAME, getDictionary } from "@/lib/i18n";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const t = getDictionary(lang);
  return { title: `${t.trips.title} · ${APP_NAME}`, description: t.trips.subtitle };
}

// "My trips". The trips live in the browser (localStorage), so the page is rendered there;
// Suspense is needed because it reads ?id from the URL.
export default async function TripsPage({ params }) {
  const { lang } = await params;
  return (
    <I18nProvider lang={lang}>
      <Suspense>
        <TripsApp />
      </Suspense>
    </I18nProvider>
  );
}
