import NotFoundPage from "@/components/layout/NotFoundPage";
import { APP_NAME } from "@/i18n/config";

// Any page that does not exist under /es or /en (a mistyped address, a route we do not publish, a deleted share)
export const metadata = { title: `404 · ${APP_NAME}`, robots: { index: false } };

const NotFound = () => <NotFoundPage />;

export default NotFound;
