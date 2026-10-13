import { useCallback, useMemo, useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { DUMMY_ACCOUNTS, type SessionUser } from "../data/dummy-accounts";

// DEV-ONLY: the "session" is just a remembered dummy-account id in
// sessionStorage. There is no real authentication anywhere in this app yet.
const STORAGE_KEY = "mbopo-admin-dev-user";

function readStoredUser(): SessionUser | null {
  try {
    const id = sessionStorage.getItem(STORAGE_KEY);
    return DUMMY_ACCOUNTS.find((a) => a.id === id) ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(readStoredUser);

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
      sessionStorage.setItem(STORAGE_KEY, account.id);
    } catch {
      /* storage unavailable — session lasts until reload */
    }
    return { ok: true as const };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
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
