import type { Role } from "@/lib/rbac";

export type ActivityCategory =
  "users" | "judging" | "voting" | "candidates" | "complaints" | "access";

export const ACTIVITY_CATEGORY_LABELS: Record<ActivityCategory, string> = {
  users: "Users",
  judging: "Judging decisions",
  voting: "Voting content",
  candidates: "Candidate profiles",
  complaints: "Complaints",
  access: "Sign-ins",
};

export interface ActivityEntry {
  id: string;
  at: string; // ISO
  // Who did it — null for system events. The tracker groups entries by this.
  actorId: string | null;
  actorName: string;
  actorRole: Role | null;
  category: ActivityCategory;
  summary: string;
}
