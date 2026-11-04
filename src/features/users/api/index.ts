import { request } from "@/lib/http";
import type { AdminUser, NewUserInput, TemporaryPassword, UserUpdate } from "../types";

export async function getUsers(): Promise<AdminUser[]> {
  return request<AdminUser[]>("/admin/users");
}

export async function createUser(
  input: NewUserInput,
): Promise<AdminUser & TemporaryPassword> {
  return request<AdminUser & TemporaryPassword>("/admin/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateUser(id: string, patch: UserUpdate): Promise<AdminUser> {
  return request<AdminUser>(`/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function setUserActive(id: string, active: boolean): Promise<AdminUser> {
  return request<AdminUser>(`/admin/users/${id}/active`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}

export interface BulkStatusResult {
  changed: AdminUser[];
  skipped: { id: string; name: string; reason: string }[];
}

// The backend has no bulk active/inactive endpoint — only one user at a
// time (PATCH /admin/users/:id/active). This calls that once per account
// and folds the results into the same {changed, skipped} shape the bulk
// UI already expects, so one refusal (e.g. "can't deactivate yourself")
// doesn't stop the rest.
export async function setUsersActive(
  ids: string[],
  active: boolean,
  users: AdminUser[],
): Promise<BulkStatusResult> {
  const changed: AdminUser[] = [];
  const skipped: BulkStatusResult["skipped"] = [];

  await Promise.all(
    ids.map(async (id) => {
      try {
        changed.push(await setUserActive(id, active));
      } catch (error: any) {
        const name = users.find((u) => u.id === id);
        skipped.push({
          id,
          name: name ? `${name.firstName} ${name.lastName}` : id,
          reason: error?.message ?? "Couldn't change this account.",
        });
      }
    }),
  );

  return { changed, skipped };
}

export async function resetPassword(id: string): Promise<TemporaryPassword> {
  return request<TemporaryPassword>(`/admin/users/${id}/reset-password`, {
    method: "POST",
  });
}

export async function deleteUser(id: string): Promise<void> {
  await request(`/admin/users/${id}`, { method: "DELETE" });
}

export interface BulkResult {
  created: (AdminUser & TemporaryPassword)[];
  // Index into the submitted list, so the form can mark the right rows.
  failed: { index: number; error: string }[];
}

export async function createUsers(inputs: NewUserInput[]): Promise<BulkResult> {
  const result = await request<{
    created: (AdminUser & TemporaryPassword)[];
    failed: { email: string; reason: string }[];
  }>("/admin/users/bulk", {
    method: "POST",
    body: JSON.stringify({ users: inputs }),
  });

  // The backend reports failures by email (create-bulk.service.ts); the
  // bulk-add UI keys them by row index instead, to mark the exact row.
  const failed = result.failed.map((f) => ({
    index: inputs.findIndex((i) => i.email.toLowerCase() === f.email.toLowerCase()),
    error: f.reason,
  }));

  return { created: result.created, failed };
}
