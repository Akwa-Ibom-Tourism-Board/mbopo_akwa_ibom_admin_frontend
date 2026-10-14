import {
  Activity,
  Crown,
  Landmark,
  MapPin,
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
import { PHASES, phaseTitle, type PhaseId } from "@/lib/phases";

export interface NavItemConfig {
  // Parent items (the Grand Finale) have children and no page of their own.
  to?: string;
  label: string;
  // Topbar title when it differs from the label ("Grand Finale · Round 1").
  title?: string;
  icon?: LucideIcon;
  children?: NavItemConfig[];
  // Stage-of-elimination items show an "Open" pill while that stage is open.
  phaseId?: PhaseId;
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
function stageItem(id: PhaseId, icon: LucideIcon | undefined): NavItemConfig {
  const p = PHASES.find((x) => x.id === id)!;
  return {
    to: p.path,
    label: p.label,
    title: phaseTitle(id),
    icon,
    phaseId: id,
    capability: "candidates.view",
  };
}

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
        to: "/judging/leaderboard",
        label: "Leaderboard",
        icon: Trophy,
        capability: "judging.leaderboard",
      },
    ],
  },
  // The stages of elimination, in order. Everyone who can see candidates gets
  // a page per stage (the candidates in it, or an empty state); each page
  // adapts to the role — judges score, Admin / Super Admin open the stage.
  {
    label: "Stages",
    items: [
      stageItem("lga", MapPin),
      stageItem("senatorial", Landmark),
      {
        label: "Grand Finale",
        icon: Crown,
        capability: "candidates.view",
        children: PHASES.filter((p) => p.group === "Grand Finale").map((p) =>
          stageItem(p.id, undefined),
        ),
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
        label: "Event Tracker",
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

// Every navigable page (children flattened in, parents without a page left out).
export const NAV_ITEMS: NavItemConfig[] = NAV_GROUPS.flatMap((g) =>
  g.items.flatMap((i) => [i, ...(i.children ?? [])]),
).filter((i) => i.to);

// Longest matching prefix wins, so /judging/leaderboard doesn't also light up
// /judging, and /candidates/:id still resolves to "Candidates".
export function matchNavItem(pathname: string) {
  return NAV_ITEMS.filter(
    (i) => pathname === i.to || pathname.startsWith(`${i.to}/`),
  ).sort((a, b) => b.to!.length - a.to!.length)[0];
}
