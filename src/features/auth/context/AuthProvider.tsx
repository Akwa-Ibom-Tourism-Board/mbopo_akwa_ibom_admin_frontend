import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "./AuthContext";
import { DUMMY_ACCOUNTS, type SessionUser } from "../data/dummy-accounts";
import { recordActivity } from "@/features/activity-log/api";
import { SESSION_KEY, readSessionUser } from "../session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(readSessionUser);
  const queryClient = useQueryClient();

  const login = useCallback(
    (email: string, password: string) => {
      const account = DUMMY_ACCOUNTS.find(
        (a) =>
          a.email.toLowerCase() === email.trim().toLowerCase() &&
          a.password === password,
      );
      if (!account)
        return { ok: false as const, error: "Incorrect email or password." };
      // Never carry one person's cached data (users, activity…) into the next
      // person's session — what each role may see differs.
      queryClient.clear();
      setUser(account);
      try {
        sessionStorage.setItem(SESSION_KEY, account.id);
      } catch {
        /* storage unavailable — session lasts until reload */
      }
      recordActivity("access", "Signed in");
      return { ok: true as const };
    },
    [queryClient],
  );

  const logout = useCallback(() => {
    recordActivity("access", "Signed out");
    queryClient.clear();
    setUser(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, [queryClient]);

  const value = useMemo(
    () => ({ user, role: user?.role ?? null, login, logout }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
