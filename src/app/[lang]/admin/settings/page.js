import { notFound } from "next/navigation";
import AdminSettings from "@/components/admin/AdminSettings";
import { isAdmin } from "@/server/admin/access";
import { globalItineraryLimit } from "@/server/itineraryLimits";

// The app-wide settings the admin can change
const AdminSettingsPage = async ({ params }) => {
  if (!(await isAdmin())) notFound();
  return <AdminSettings globalLimit={await globalItineraryLimit()} lang={(await params).lang} />;
};

export default AdminSettingsPage;
