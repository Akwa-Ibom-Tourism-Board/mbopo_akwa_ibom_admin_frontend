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
  | "super_admin"
  | "admin"
  | "media"
  | "judge"
  | "head_judge"
  | "customer_service";

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  media: "Media",
  judge: "Judge",
  head_judge: "Head Judge",
  customer_service: "Customer Service",
};

export type Capability =
  // Candidates
  | "candidates.view"
  | "candidates.editPublicProfile"
  // Admin / Super Admin only: see the full NIN/VIN (everyone else sees them
  // masked), edit an applicant's details and upload or replace documents.
  | "candidates.viewIdentity"
  // Everything about a candidate beyond their name: stage, status, location,
  // application, documents. Media deliberately does NOT have this — they see
  // names and work only on public profiles.
  | "candidates.viewDetails"
  // The stages of elimination: their pages, candidates in them, status.
  | "stages.view"
  | "candidates.editDetails"
  // Admin / Super Admin: a candidate's own activity history.
  | "candidates.viewActivity"
  // Judging — the two judge roles only. Deliberately granted to no other
  // role, including Super Admin: nobody outside the panel sees live scores.
  | "judging.access"
  | "judging.score"
  | "judging.decide"
  | "judging.leaderboard"
  // Head Judge only: finalize the added-up scores and close a stage.
  | "judging.finalize"
  // Admin / Super Admin only: open the next stage (LGA, Senatorial, each
  // Grand Finale round). Judges can close a stage out but never open one.
  | "stages.open"
  // Super Admin only: reopen ANY closed stage (everything after it is wiped).
  // Admin can only reopen the most recently closed one.
  | "stages.reopenAny"
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
  "head_judge",
  "customer_service",
];

// The permission matrix (BUILD_ME.md §3) as data: capability -> roles.
export const PERMISSIONS: Record<Capability, readonly Role[]> = {
  "candidates.view": ["super_admin", "admin", "media", "judge", "head_judge"],
  "candidates.editPublicProfile": ["super_admin", "admin", "media"],
  "candidates.viewIdentity": ["super_admin", "admin"],
  "candidates.viewDetails": ["super_admin", "admin", "judge", "head_judge"],
  "stages.view": ["super_admin", "admin", "judge", "head_judge"],
  "candidates.editDetails": ["super_admin", "admin"],
  "candidates.viewActivity": ["super_admin", "admin"],

  "judging.access": ["judge", "head_judge"],
  "judging.score": ["judge", "head_judge"],
  "judging.decide": ["judge", "head_judge"],
  "judging.leaderboard": ["judge", "head_judge"],
  "judging.finalize": ["head_judge"],

  "stages.open": ["super_admin", "admin"],
  "stages.reopenAny": ["super_admin"],

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
  super_admin: ["admin", "media", "judge", "head_judge", "customer_service"],
  admin: ["media", "judge", "head_judge", "customer_service"],
  media: [],
  judge: [],
  head_judge: [],
  customer_service: [],
};

// The two roles that sit on the judging panel.
export const isJudgeRole = (role: Role | null | undefined) =>
  role === "judge" || role === "head_judge";

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
