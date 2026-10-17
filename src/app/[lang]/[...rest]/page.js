import { notFound } from "next/navigation";

// Any other address under /es or /en: our own "not found" page ([lang]/not-found.js), in the app's design and
// language. Without this, Next shows its plain one for addresses that match no page.
const UnknownPage = () => notFound();

export default UnknownPage;
