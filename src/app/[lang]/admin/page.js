import { notFound } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { isAdmin } from "@/server/admin/access";
import { DEFAULT_PERIOD, PERIODS, getAdminStats } from "@/server/admin/stats";

// The admin's overview for the period in ?period= (7, 30, 90 or all; 30 days by default), read on every visit
const AdminPage = async ({ params, searchParams }) => {
  if (!(await isAdmin())) notFound();
  const { lang } = await params;
  const asked = String((await searchParams).period ?? "");
  const period = PERIODS.includes(asked) ? asked : DEFAULT_PERIOD;
  return <AdminDashboard stats={await getAdminStats(period)} periods={PERIODS} lang={lang} />;
};

export default AdminPage;
