import { request } from "@/lib/http";
import { localStore, STORAGE_KEYS } from "@/lib/storage";
import type { AdminUser } from "./types";

interface LoginResponse {
  token: string;
  refreshToken: string;
  admin: AdminUser;
}

function persistSession(data: { token: string; refreshToken: string; admin: AdminUser }) {
  localStore.set(STORAGE_KEYS.authToken, data.token);
  localStore.set(STORAGE_KEYS.authRefreshToken, data.refreshToken);
  localStore.set(STORAGE_KEYS.authUser, data.admin);
}

export function clearSession(): void {
  localStore.remove(STORAGE_KEYS.authToken);
  localStore.remove(STORAGE_KEYS.authRefreshToken);
  localStore.remove(STORAGE_KEYS.authUser);
}

export async function login(email: string, password: string): Promise<AdminUser> {
  const data = await request<LoginResponse>("/admin/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  persistSession(data);
  return data.admin;
}

export async function fetchMe(): Promise<AdminUser> {
  const admin = await request<AdminUser>("/admin/auth/me");
  localStore.set(STORAGE_KEYS.authUser, admin);
  return admin;
}

export async function logout(): Promise<void> {
  try {
    await request("/admin/auth/logout", { method: "POST" });
  } finally {
    clearSession();
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await request("/admin/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
