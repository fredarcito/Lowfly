import { notFound } from "next/navigation";
import UserList from "@/components/admin/UserList";
import { isAdmin } from "@/server/admin/access";
import { listAdminUsers } from "@/server/admin/users";

// Every account, or the ones found by ?q= (email or name)
const AdminUsersPage = async ({ params, searchParams }) => {
  if (!(await isAdmin())) notFound();
  const query = String((await searchParams).q ?? "").slice(0, 100);
  const { users, globalLimit } = await listAdminUsers(query);
  return <UserList users={users} globalLimit={globalLimit} query={query} lang={(await params).lang} />;
};

export default AdminUsersPage;
