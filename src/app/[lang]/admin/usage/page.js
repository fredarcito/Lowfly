import { notFound } from "next/navigation";
import AdminUsage from "@/components/admin/AdminUsage";
import { isAdmin } from "@/server/admin/access";
import { DEFAULT_USAGE_PERIOD, USAGE_PERIODS, getUsageStats } from "@/server/admin/usage";

// Which kinds of search people use and how the airlines answer, for the period in ?period= (7, 30 or 90 days; 7 by
// default), read on every visit
const AdminUsagePage = async ({ params, searchParams }) => {
  if (!(await isAdmin())) notFound();
  const { lang } = await params;
  const asked = String((await searchParams).period ?? "");
  const period = USAGE_PERIODS.includes(asked) ? asked : DEFAULT_USAGE_PERIOD;
  return <AdminUsage stats={await getUsageStats(period)} periods={USAGE_PERIODS} lang={lang} />;
};

export default AdminUsagePage;
