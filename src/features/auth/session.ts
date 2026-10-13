import { DUMMY_ACCOUNTS, type SessionUser } from "./data/dummy-accounts";

// DEV-ONLY session storage: the "session" is a remembered dummy-account id.
// Shared by AuthProvider and the dummy api layers (activity log, complaint
// replies) so they can attribute actions without a real auth token.
export const SESSION_KEY = "mbopo-admin-dev-user";

export function readSessionUser(): SessionUser | null {
  try {
    const id = sessionStorage.getItem(SESSION_KEY);
    return DUMMY_ACCOUNTS.find((a) => a.id === id) ?? null;
  } catch {
    return null;
  }
}
