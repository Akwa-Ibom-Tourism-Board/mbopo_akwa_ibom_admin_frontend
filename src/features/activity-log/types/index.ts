import type { Role } from "@/lib/rbac";

export type ActivityCategory =
  "users" | "judging" | "voting" | "candidates" | "complaints";

export const ACTIVITY_CATEGORY_LABELS: Record<ActivityCategory, string> = {
  users: "Users",
  judging: "Judging decisions",
  voting: "Voting content",
  candidates: "Candidate profiles",
  complaints: "Complaints",
};

export interface ActivityEntry {
  id: string;
  at: string; // ISO
  actorName: string;
  actorRole: Role | null;
  category: ActivityCategory;
  summary: string;
}
