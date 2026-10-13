import type { Role } from "@/lib/rbac";

/*
 * DEV-ONLY dummy accounts — replace wholesale once real backend auth exists.
 * Not something to carry into production.
 */
export interface SessionUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  // DEV-ONLY plaintext password — real auth never stores or ships these.
  password: string;
  role: Role;
  blurb: string;
}

export const DUMMY_ACCOUNTS: SessionUser[] = [
  {
    id: "u-super-1",
    firstName: "Ekemini",
    lastName: "Essien",
    email: "super.admin@mbopo.test",
    password: "Mbopo@2026",
    role: "super_admin",
    blurb: "Full control of users, voting platform, pricing and oversight.",
  },
  {
    id: "u-admin-1",
    firstName: "Utibe",
    lastName: "Akpan",
    email: "admin@mbopo.test",
    password: "Mbopo@2026",
    role: "admin",
    blurb:
      "Manages staff, content and pricing. Cannot see or influence judging.",
  },
  {
    id: "u-media-1",
    firstName: "Mfon",
    lastName: "Bassey",
    email: "media@mbopo.test",
    password: "Mbopo@2026",
    role: "media",
    blurb:
      "Uploads images, links YouTube videos, edits candidate public profiles.",
  },
  {
    id: "u-judge-1",
    firstName: "Idara",
    lastName: "Okon",
    email: "judge@mbopo.test",
    password: "Mbopo@2026",
    role: "judge",
    blurb: "Scores candidates, advances or disqualifies, sees the leaderboard.",
  },
  {
    id: "u-hj-1",
    firstName: "Mbuk",
    lastName: "Inyang",
    email: "head.judge@mbopo.test",
    password: "Mbopo@2026",
    role: "head_judge",
    blurb:
      "Everything a judge can do, plus finalizing the added-up scores and closing a stage.",
  },
  {
    id: "u-cs-1",
    firstName: "Nsikak",
    lastName: "Umoh",
    email: "support@mbopo.test",
    password: "Mbopo@2026",
    role: "customer_service",
    blurb: "Responds to complaints from contestants and the public.",
  },
];
