import FlightSearch from "@/components/search/FlightSearch";
import { I18nProvider } from "@/providers/I18nProvider";

export default async function Page({ params }) {
  const { lang } = await params;
  return (
    <I18nProvider lang={lang}>
      <FlightSearch />
    </I18nProvider>
  );
}
