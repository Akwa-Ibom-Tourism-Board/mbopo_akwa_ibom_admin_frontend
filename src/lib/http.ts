import { API_BASE_URL } from "./config";
import { localStore, STORAGE_KEYS } from "./storage";

export class ApiError extends Error {
  status: number;
  // Per-field Joi messages, when the backend's validate() middleware is
  // what rejected the request — see its validate.ts's respondWithErrors.
  errors?: string[];

  constructor(message: string, status: number, errors?: string[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

interface ApiEnvelope<T> {
  status: "success" | "error";
  message: string;
  data?: T;
  errors?: string[];
}

// Every authenticated request carries both tokens unconditionally — the
// backend's authenticateAdmin middleware only actually reads x-refresh-token
// when the access token has already expired, so sending it unused on every
// other request is harmless and avoids decoding the JWT client-side just to
// predict when it's about to expire.
function getStoredTokens() {
  return {
    accessToken: localStore.get<string>(STORAGE_KEYS.authToken),
    refreshToken: localStore.get<string>(STORAGE_KEYS.authRefreshToken),
  };
}

// A refresh that happens inside authenticate-admin.ts rotates both tokens
// and hands the new ones back on these two response headers (see that
// middleware, and the backend's app.ts cors() exposedHeaders) — store them
// immediately so the next request already uses the refreshed pair instead
// of the one that just expired.
function captureRotatedTokens(response: Response): void {
  const nextAccessToken = response.headers.get("x-access-token");
  const nextRefreshToken = response.headers.get("x-refresh-token");
  if (nextAccessToken) localStore.set(STORAGE_KEYS.authToken, nextAccessToken);
  if (nextRefreshToken) localStore.set(STORAGE_KEYS.authRefreshToken, nextRefreshToken);
}

// A 403 the backend's authenticateAdmin middleware itself produces when the
// account has just been deactivated — this is the one 403 that really does
// mean "your session is no longer valid," unlike requireCapability's 403
// ("you're signed in fine, you just can't do this one thing"), which must
// never sign anyone out. Matched by exact text since both are 403s.
const DEACTIVATED_MESSAGE = "This account has been deactivated.";

// Set by AuthProvider so the http layer can force a sign-out on a 401 (or
// the deactivation 403 above) without importing the auth feature here (that
// would be a circular dependency — auth imports this module to make its
// own requests).
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const { accessToken, refreshToken } = getStoredTokens();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (refreshToken) headers["x-refresh-token"] = refreshToken;

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

  captureRotatedTokens(response);

  if (response.status === 204) return undefined as T;

  const body = (await response.json().catch(() => undefined)) as ApiEnvelope<T> | undefined;

  if (!response.ok) {
    const isAuthFailure =
      response.status === 401 || (response.status === 403 && body?.message === DEACTIVATED_MESSAGE);
    if (isAuthFailure && accessToken) {
      onUnauthorized?.();
    }
    throw new ApiError(body?.message ?? response.statusText, response.status, body?.errors);
  }

  return body?.data as T;
}

// The backend marks every deliberate rejection it throws (wrong password,
// a business rule like "every judge must finish scoring first") as
// `isOperational: true` with a status below 500 and a message that's
// already safe to show verbatim — see its error-handler.ts. A 5xx, or
// anything that wasn't even an ApiError (a network failure, a bad response
// body), isn't something the backend wrote for a user to read, so those
// fall back to a generic message instead.
export function friendlyMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  return error instanceof ApiError && error.status < 500 ? error.message : fallback;
}
