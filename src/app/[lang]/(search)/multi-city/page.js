import { searchPageMetadata } from "@/utils/searchPage";

// The "multiCity" search's own page (its name in each language: constants/sections). The search itself is the
// layout's, shared by every search page.
export const generateMetadata = ({ params }) => searchPageMetadata(params, "multiCity");

const MultiCityPage = () => null;

export default MultiCityPage;
