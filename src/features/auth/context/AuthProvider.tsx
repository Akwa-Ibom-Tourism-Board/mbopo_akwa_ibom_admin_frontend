import { useCallback, useMemo, useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { DUMMY_ACCOUNTS, type SessionUser } from "../data/dummy-accounts";
import { SESSION_KEY, readSessionUser } from "../session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(readSessionUser);

  const login = useCallback((email: string, password: string) => {
    const account = DUMMY_ACCOUNTS.find(
      (a) =>
        a.email.toLowerCase() === email.trim().toLowerCase() &&
        a.password === password,
    );
    if (!account)
      return { ok: false as const, error: "Incorrect email or password." };
    setUser(account);
    try {
      sessionStorage.setItem(SESSION_KEY, account.id);
    } catch {
      /* storage unavailable — session lasts until reload */
    }
    return { ok: true as const };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ user, role: user?.role ?? null, login, logout }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
