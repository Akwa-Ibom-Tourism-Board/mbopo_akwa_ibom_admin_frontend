import { createContext } from "react";
import type { Role } from "@/lib/rbac";
import type { SessionUser } from "../data/dummy-accounts";

export interface AuthContextValue {
  user: SessionUser | null;
  role: Role | null;
  login: (
    email: string,
    password: string,
  ) => { ok: true } | { ok: false; error: string };
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
