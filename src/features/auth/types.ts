import type { Role } from "@/lib/rbac";

// Mirrors the backend's serializeAdminUser() exactly (admin/helpers/admin-auth.helpers.ts).
export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
  passwordChangedAt: string | null;
}
