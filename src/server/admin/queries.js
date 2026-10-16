// Reads the admin pages share, with the secret key client (supabase/admin). Supabase hands out a page of rows
// (or accounts) per request: these read them all.
const PAGE = 1000;

// Every account
export const allUsers = async (supabase) => {
  const users = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: PAGE });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < PAGE) return users;
  }
};

// Every row of `table` with the `columns` asked for, oldest first by `orderBy`; `filter` narrows the query
// (e.g. to one account's rows)
export const allRows = async (supabase, table, columns, { filter = (query) => query, orderBy = "created_at" } = {}) => {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await filter(supabase.from(table).select(columns)).order(orderBy).range(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < PAGE) return rows;
  }
};

// The AI calls behind itineraries, with what each needs for its cost (server/admin/aiPrices)
export const USAGE_COLUMNS = "created_at, request_id, user_id, trip_id, city, country, days, provider, model, input_tokens, output_tokens";

export const countRows = async (supabase, table) => {
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
};
