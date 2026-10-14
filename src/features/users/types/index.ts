import type { Role } from "@/lib/rbac";

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string; // ISO
  // When a temporary password was last emailed to them. Passwords themselves
  // are never stored in a readable form or shown to anyone.
  passwordChangedAt: string; // ISO
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
