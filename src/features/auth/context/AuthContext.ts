import { createContext } from "react";
import type { Role } from "@/lib/rbac";
import type { AdminUser } from "../types";

export interface AuthContextValue {
  user: AdminUser | null;
  role: Role | null;
  // True only while the app is restoring a session from a stored token on
  // first load — RequireAuth waits on this instead of redirecting to
  // /login for someone who's actually still signed in.
  loading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
