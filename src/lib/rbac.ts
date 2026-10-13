import { useAuth } from "@/features/auth/hooks/useAuth";

/*
 * ⚠️  FRONTEND-ONLY PERMISSION CHECKS — NOT REAL ACCESS CONTROL.
 *
 * Everything in this file decides what the UI *shows*: which routes render,
 * which nav items and buttons appear. It does nothing to stop a direct API
 * call. When the real backend is wired up, every rule below must be enforced
 * again, independently, server-side. Do not treat this as security.
 */

export type Role =
  "super_admin" | "admin" | "media" | "judge" | "customer_service";

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  media: "Media",
  judge: "Judge",
  customer_service: "Customer Service",
};

export type Capability =
  // Candidates
  | "candidates.view"
  | "candidates.editPublicProfile"
  // Judging — judges only. Deliberately granted to no other role, including
  // Super Admin: nobody outside the judging role sees live scores.
  | "judging.access"
  | "judging.score"
  | "judging.decide"
  | "judging.leaderboard"
  // Voting platform
  | "voting.pricing"
  | "voting.news"
  | "voting.sponsors"
  // Users
  | "users.manage"
  // Complaints
  | "complaints.view"
  | "complaints.respond"
  | "complaints.reassign"
  // Audit trail
  | "activity.view";

const ALL_ROLES: Role[] = [
  "super_admin",
  "admin",
  "media",
  "judge",
  "customer_service",
];

// The permission matrix (BUILD_ME.md §3) as data: capability -> roles.
export const PERMISSIONS: Record<Capability, readonly Role[]> = {
  "candidates.view": ["super_admin", "admin", "media", "judge"],
  "candidates.editPublicProfile": ["super_admin", "admin", "media"],

  "judging.access": ["judge"],
  "judging.score": ["judge"],
  "judging.decide": ["judge"],
  "judging.leaderboard": ["judge"],

  "voting.pricing": ["super_admin", "admin"],
  "voting.news": ["super_admin", "admin", "media"],
  "voting.sponsors": ["super_admin", "admin", "media"],

  "users.manage": ["super_admin", "admin"],

  "complaints.view": ["super_admin", "admin", "customer_service"],
  "complaints.respond": ["customer_service"],
  "complaints.reassign": ["super_admin", "admin"],

  "activity.view": ["super_admin", "admin"],
};

// Which roles a given role may create/edit/deactivate. "super_admin" is never
// listed as a target — it can't be created through this app, by anyone.
export const ASSIGNABLE_ROLES: Record<Role, readonly Role[]> = {
  super_admin: ["admin", "media", "judge", "customer_service"],
  admin: ["media", "judge", "customer_service"],
  media: [],
  judge: [],
  customer_service: [],
};

export function can(role: Role | null | undefined, capability: Capability) {
  return !!role && PERMISSIONS[capability].includes(role);
}

export function canAssignRole(actor: Role | null | undefined, target: Role) {
  return !!actor && ASSIGNABLE_ROLES[actor].includes(target);
}

export function useCan() {
  const { role } = useAuth();
  return (capability: Capability) => can(role, capability);
}

export { ALL_ROLES };
