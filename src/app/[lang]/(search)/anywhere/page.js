import { searchPageMetadata } from "@/utils/searchPage";

// The "everywhere" search's own page (its name in each language: constants/sections). The search itself is the layout's,
// shared by every search page.
export const generateMetadata = ({ params }) => searchPageMetadata(params, "everywhere");

const AnywherePage = () => null;

export default AnywherePage;
