import { test } from "@playwright/test";

// Test accounts in the app's Supabase project: created for a test and deleted after it (with them go their
// trips and shares). Needs the secret key (.env.local); without it these tests are skipped.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const skipWithoutSupabase = () => test.skip(!SUPABASE_URL || !SECRET_KEY, "Supabase keys are not set (.env.local)");

const asAdmin = (path, init = {}) =>
  fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: { apikey: SECRET_KEY, authorization: `Bearer ${SECRET_KEY}`, "content-type": "application/json", ...init.headers },
  });

// A new confirmed account: { id, email, password }
export const createTestUser = async ({ fullName = "Tester Lowfly" } = {}) => {
  const email = `lowfly-e2e-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;
  const password = `Test-${Math.random().toString(36).slice(2)}-Aa1`;
  const response = await asAdmin("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { full_name: fullName } }),
  });
  const created = await response.json();
  if (!created.id) throw new Error(`Could not create a test user: ${JSON.stringify(created)}`);
  return { id: created.id, email, password };
};

export const deleteTestUser = (user) => asAdmin(`/auth/v1/admin/users/${user.id}`, { method: "DELETE" });

// The account as Supabase keeps it: { id, email, user_metadata, … }
export const accountUser = async (user) => (await asAdmin(`/auth/v1/admin/users/${user.id}`)).json();

// The account's trips as stored: [{ id, data }]
export const accountTrips = async (user) =>
  (await asAdmin(`/rest/v1/trips?select=id,data&user_id=eq.${user.id}`)).json();

// A trip saved in the account and shared: the share's id (the link)
export const shareTripAs = async (user, trip) => {
  await asAdmin("/rest/v1/trips", { method: "POST", body: JSON.stringify({ user_id: user.id, id: trip.id, data: trip }) });
  const response = await asAdmin("/rest/v1/trip_shares", {
    method: "POST",
    headers: { prefer: "return=representation" },
    body: JSON.stringify({ user_id: user.id, trip_id: trip.id }),
  });
  const [share] = await response.json();
  return share.id;
};

// Signs the page in as `user` (the session goes to cookies, as after Google or the email link), then reloads
export const signIn = async (page, user) => {
  await page.evaluate(
    async ({ url, key, email, password }) => {
      const { createBrowserClient } = await import("https://esm.sh/@supabase/ssr@0.12.7");
      const { error } = await createBrowserClient(url, key).auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
    },
    { url: SUPABASE_URL, key: PUBLISHABLE_KEY, email: user.email, password: user.password }
  );
};
