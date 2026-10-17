import { notFound } from "next/navigation";
import UserList from "@/components/admin/UserList";
import { isAdmin } from "@/server/admin/access";
import { listAdminUsers } from "@/server/admin/users";
import { readUserListParams } from "@/constants/adminUserList";

// The accounts, one page at a time, as the address asks: ?q= (email or name), &filter=, &sort=, &dir=, &page=
const AdminUsersPage = async ({ params, searchParams }) => {
  if (!(await isAdmin())) notFound();
  const view = readUserListParams(await searchParams);
  const list = await listAdminUsers(view);
  return <UserList {...list} view={{ ...view, page: list.page }} lang={(await params).lang} />;
};

export default AdminUsersPage;
