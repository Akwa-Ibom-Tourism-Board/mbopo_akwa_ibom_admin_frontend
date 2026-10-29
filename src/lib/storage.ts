// Typed, JSON-safe wrappers around localStorage. Every client-side session
// value the admin app keeps (tokens, the cached admin user) is keyed
// through here instead of being repeated as string literals across
// features. "admin-" prefixed so this app's storage never collides with
// the applicant-facing mbopo_akwa_ibom_design app if both are ever open in
// the same browser profile.
export const STORAGE_KEYS = {
  authToken: "mbopo-admin-auth-token",
  authRefreshToken: "mbopo-admin-auth-refresh-token",
  authUser: "mbopo-admin-auth-user",
} as const;

function readStorage<T>(key: string): T | undefined {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode, quota) — the app degrades
    // to in-memory-only state for that session rather than crashing.
  }
}

export const localStore = {
  get: <T>(key: string) => readStorage<T>(key),
  set: <T>(key: string, value: T) => writeStorage(key, value),
  remove: (key: string) => window.localStorage.removeItem(key),
};
