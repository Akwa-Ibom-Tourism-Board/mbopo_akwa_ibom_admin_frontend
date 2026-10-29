// The backend mounts every route under /api/v1 (see its src/app.ts) — this
// must include that prefix, e.g. http://localhost:3090/api/v1 in dev.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
