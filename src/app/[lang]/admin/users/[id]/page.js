import { notFound } from "next/navigation";
import UserDetail from "@/components/admin/UserDetail";
import { currentAdmin } from "@/server/admin/access";
import { getAdminUser } from "@/server/admin/users";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// One account in full
const AdminUserPage = async ({ params }) => {
  const { lang, id } = await params;
  const me = await currentAdmin();
  if (!me || !UUID.test(id)) notFound();
  const user = await getAdminUser(id);
  if (!user) notFound();
  // Their own account: no deleting, blocking or giving up the admin
  return <UserDetail user={user} lang={lang} self={user.id === me.id} />;
};

export default AdminUserPage;
