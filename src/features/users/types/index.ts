import type { Role } from "@/lib/rbac";

// Mirrors the backend's serializeAdminUser() (admin/helpers/admin-auth.helpers.ts).
export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string; // ISO
  passwordChangedAt: string | null; // ISO
}

export interface NewUserInput {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

export type UserUpdate = Partial<Omit<NewUserInput, "email">> & {
  email?: string;
};

// The backend never emails this — see create.service.ts / create-bulk.service.ts
// / reset-password.service.ts — it's generated and handed back once in the
// response, so the admin creating the account must pass it on themselves.
export interface TemporaryPassword {
  email: string;
  temporaryPassword: string;
}
