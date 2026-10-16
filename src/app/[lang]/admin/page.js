import { notFound } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { isAdmin } from "@/server/admin/access";
import { getAdminStats } from "@/server/admin/stats";

// The admin's figures, read on every visit
const AdminPage = async ({ params }) => {
  if (!(await isAdmin())) notFound();
  return <AdminDashboard stats={await getAdminStats()} lang={(await params).lang} />;
};

export default AdminPage;
