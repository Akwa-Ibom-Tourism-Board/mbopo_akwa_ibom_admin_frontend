import {
  Activity,
  Gavel,
  LayoutDashboard,
  LifeBuoy,
  Newspaper,
  Handshake,
  Tag,
  Trophy,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Capability } from "@/lib/rbac";

export interface NavItemConfig {
  to: string;
  label: string;
  icon: LucideIcon;
  // Omitted = visible to every signed-in role.
  capability?: Capability;
}

export interface NavGroupConfig {
  label: string;
  items: NavItemConfig[];
}

// Single source for the sidebar *and* the topbar title. An item only renders
// for a role that holds its capability — and each route is separately
// protected by RoleGuard, so hiding a link is never the only barrier.
export const NAV_GROUPS: NavGroupConfig[] = [
  {
    label: "Overview",
    items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Pageant",
    items: [
      {
        to: "/candidates",
        label: "Candidates",
        icon: Users,
        capability: "candidates.view",
      },
      {
        to: "/judging",
        label: "Judging Queue",
        icon: Gavel,
        capability: "judging.access",
      },
      {
        to: "/judging/leaderboard",
        label: "Leaderboard",
        icon: Trophy,
        capability: "judging.leaderboard",
      },
    ],
  },
  {
    label: "Voting platform",
    items: [
      {
        to: "/voting/pricing",
        label: "Vote Pricing",
        icon: Tag,
        capability: "voting.pricing",
      },
      {
        to: "/voting/picture-news",
        label: "Picture News",
        icon: Newspaper,
        capability: "voting.news",
      },
      {
        to: "/voting/sponsors",
        label: "Sponsors",
        icon: Handshake,
        capability: "voting.sponsors",
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        to: "/users",
        label: "Users",
        icon: UserCog,
        capability: "users.manage",
      },
      {
        to: "/activity-log",
        label: "Activity Log",
        icon: Activity,
        capability: "activity.view",
      },
    ],
  },
  {
    label: "Support",
    items: [
      {
        to: "/complaints",
        label: "Complaints",
        icon: LifeBuoy,
        capability: "complaints.view",
      },
    ],
  },
];

export const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

// Longest matching prefix wins, so /judging/leaderboard doesn't also light up
// /judging, and /candidates/:id still resolves to "Candidates".
export function matchNavItem(pathname: string) {
  return NAV_ITEMS.filter(
    (i) => pathname === i.to || pathname.startsWith(`${i.to}/`),
  ).sort((a, b) => b.to.length - a.to.length)[0];
}
