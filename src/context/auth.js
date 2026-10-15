"use client";

import { createContext, useContext } from "react";

// The visitor's account: { status: "loading" | "signedIn" | "signedOut", user, tripsReady, signOut } (providers/AuthProvider)
export const AuthContext = createContext({ status: "loading", user: null, tripsReady: false, signOut: () => {} });

export const useAuth = () => useContext(AuthContext);
