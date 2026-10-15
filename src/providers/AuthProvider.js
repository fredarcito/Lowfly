"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "@/context/auth";
import { supabaseBrowser } from "@/supabase/browser";
import { forgetTrips, startTripsCloud } from "@/store/tripsCloud";

// Follows the Supabase session for the whole app: who is signed in, and while they are, their trips are kept
// in their account (store/tripsCloud). Signing out forgets those trips in this browser.
// `tripsReady`: the account's trips are in and changes are being copied (until then, a trip saved here could be lost).
export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState({ status: "loading", user: null, tripsReady: false });

  useEffect(() => {
    const supabase = supabaseBrowser();
    let userId = null;
    let stopCloud = null;

    const follow = async (user) => {
      if ((user?.id ?? null) === userId) {
        setSession((current) => ({ ...current, status: user ? "signedIn" : "signedOut", user, tripsReady: user ? current.tripsReady : true }));
        return;
      }
      setSession({ status: user ? "signedIn" : "signedOut", user, tripsReady: !user });
      const wasSignedIn = Boolean(userId);
      userId = user?.id ?? null;
      stopCloud?.();
      stopCloud = null;
      if (user) {
        stopCloud = await startTripsCloud(user.id);
        setSession((current) => (current.user?.id === user.id ? { ...current, tripsReady: true } : current));
      } else if (wasSignedIn) forgetTrips();
    };

    // Supabase: no other Supabase call inside this callback (it would wait for itself), so it runs just after
    const { data } = supabase.auth.onAuthStateChange((event, current) => {
      setTimeout(() => follow(current?.user ?? null), 0);
    });
    return () => {
      data.subscription.unsubscribe();
      stopCloud?.();
    };
  }, []);

  const value = useMemo(() => ({ ...session, signOut: () => supabaseBrowser().auth.signOut() }), [session]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

