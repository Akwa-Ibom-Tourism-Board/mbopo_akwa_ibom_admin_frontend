import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { setUnauthorizedHandler, friendlyMessage } from "@/lib/http";
import { localStore, STORAGE_KEYS } from "@/lib/storage";
import { AuthContext } from "./AuthContext";
import { clearSession, fetchMe, login as loginRequest, logout as logoutRequest } from "../api";
import type { AdminUser } from "../types";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() =>
    localStore.get<AdminUser>(STORAGE_KEYS.authUser) ?? null,
  );
  // Starts true whenever a token might still be valid, so RequireAuth
  // doesn't bounce an already-signed-in person to /login while /me is
  // still in flight on page load.
  const [loading, setLoading] = useState(
    () => Boolean(localStore.get(STORAGE_KEYS.authToken) || localStore.get(STORAGE_KEYS.authRefreshToken)),
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading) return;
    fetchMe()
      .then(setUser)
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
    // Runs once, on mount, regardless of dependency changes — this is a
    // one-time session restore, not something to re-run on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOutLocally = useCallback(() => {
    clearSession();
    queryClient.clear();
    setUser(null);
  }, [queryClient]);

  // A 401/403 from any request (expired refresh token, deactivated
  // account) ends the session immediately — no second network call, since
  // the one that just failed already proved the session is gone.
  useEffect(() => {
    setUnauthorizedHandler(signOutLocally);
    return () => setUnauthorizedHandler(null);
  }, [signOutLocally]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        // Never carry one person's cached data (candidates, users…) into
        // the next person's session — what each role may see differs.
        queryClient.clear();
        const admin = await loginRequest(email, password);
        setUser(admin);
        return { ok: true as const };
      } catch (error) {
        return { ok: false as const, error: friendlyMessage(error, "Incorrect email or password.") };
      }
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      signOutLocally();
    }
  }, [signOutLocally]);

  const value = useMemo(
    () => ({ user, role: user?.role ?? null, loading, login, logout }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
