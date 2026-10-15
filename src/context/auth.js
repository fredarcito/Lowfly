"use client";

import { createContext, useContext } from "react";

// The visitor's account: { status: "loading" | "signedIn" | "signedOut", user, signOut } (providers/AuthProvider)
export const AuthContext = createContext({ status: "loading", user: null, signOut: () => {} });

export const useAuth = () => useContext(AuthContext);
