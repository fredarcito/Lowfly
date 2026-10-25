import FlightSearch from "@/components/search/FlightSearch";
import InstallBanner from "@/components/search/InstallBanner";
import { I18nProvider } from "@/providers/I18nProvider";

// Every search page (the home and each kind of search's own page, constants/searchPages) shares the search: moving
// between them (its tabs) keeps what was typed and the page does not load again. Each page adds its own title and
// description for search engines.
const SearchLayout = async ({ children, params }) => {
  const { lang } = await params;
  return (
    <I18nProvider lang={lang}>
      {children}
      <FlightSearch />
      <InstallBanner />
    </I18nProvider>
  );
};

export default SearchLayout;
