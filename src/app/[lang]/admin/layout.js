import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { I18nProvider } from "@/providers/I18nProvider";
import { APP_NAME } from "@/i18n";
import { isAdmin } from "@/server/admin/access";

export const metadata = { title: `Admin · ${APP_NAME}`, robots: { index: false, follow: false } };

// Every admin page: only for admins (anyone else gets "not found", as if it did not exist), in the admin's own
// frame. Each page checks again before reading anything.
const AdminLayout = async ({ children, params }) => {
  const { lang } = await params;
  if (!(await isAdmin())) notFound();
  return (
    <I18nProvider lang={lang}>
      <AdminShell lang={lang}>{children}</AdminShell>
    </I18nProvider>
  );
};

export default AdminLayout;
