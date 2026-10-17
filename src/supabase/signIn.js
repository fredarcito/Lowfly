"use client";

// Signing in from anywhere in the app. Both ways come back through /api/auth/callback, which opens the session
// and goes on to `next` (a path of this site, e.g. the trip they were on).
import { supabaseBrowser } from "@/supabase/browser";
import { track } from "@/utils/analytics";

const callbackTo = (next) => `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`;

// Leaves for Google's sign-in page; resolves with { error } only when it could not start
export const signInWithGoogle = (next) => {
  track("sign_in_started", { method: "google" });
  return supabaseBrowser().auth.signInWithOAuth({ provider: "google", options: { redirectTo: callbackTo(next) } });
};

// Sends a sign-in link to `email`, written in `lang` for a new account (AuthProvider keeps it after): { error } or nothing
export const signInWithEmail = (email, next, lang) => {
  track("sign_in_started", { method: "email" });
  return supabaseBrowser().auth.signInWithOtp({ email, options: { emailRedirectTo: callbackTo(next), data: { locale: lang } } });
};
