// Who may use the admin: an account with the "admin" role in its app_metadata, which only the secret key can set
// (unlike user_metadata, the visitor cannot change it). The session's verified token says who is asking; the
// account itself is read again, so an admin whose role was taken away, or who was blocked, loses access at once
// (the token would only catch up within the hour).
import { supabaseAdmin } from "@/supabase/admin";
import { supabaseServer } from "@/supabase/server";

// The admin asking ({ id }), or null for anyone else
export const currentAdmin = async () => {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (claims?.app_metadata?.role !== "admin") return null;
  const { data: account } = await supabaseAdmin().auth.admin.getUserById(claims.sub);
  const user = account?.user;
  const blocked = user?.banned_until && new Date(user.banned_until) > new Date();
  return user?.app_metadata?.role === "admin" && !blocked ? { id: user.id } : null;
};

export const isAdmin = async () => Boolean(await currentAdmin());
