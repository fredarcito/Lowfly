import { searchPageMetadata } from "@/utils/searchPage";

// The "trip" search's own page (its name in each language: constants/sections). The search itself is the layout's,
// shared by every search page.
export const generateMetadata = ({ params }) => searchPageMetadata(params, "trip");

const FlexibleDatesPage = () => null;

export default FlexibleDatesPage;
