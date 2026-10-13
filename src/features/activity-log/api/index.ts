import { readSessionUser } from "@/features/auth/session";
import { MOCK_ACTIVITY } from "../data/mock-activity";
import type { ActivityCategory, ActivityEntry } from "../types";

const delay = (ms = 150) => new Promise((r) => setTimeout(r, ms));

let entries: ActivityEntry[] = MOCK_ACTIVITY.map((e) => ({ ...e }));

export async function getActivity(): Promise<ActivityEntry[]> {
  await delay();
  return [...entries].sort((a, b) => b.at.localeCompare(a.at));
}

// Called by every other feature's api whenever something meaningful happens.
// The actor comes from the dev-only session; the real backend will take it
// from the authenticated request and write the entry itself.
export function recordActivity(category: ActivityCategory, summary: string) {
  const actor = readSessionUser();
  entries = [
    {
      id: `act-${Math.random().toString(36).slice(2, 9)}`,
      at: new Date().toISOString(),
      actorName: actor ? `${actor.firstName} ${actor.lastName}` : "System",
      actorRole: actor?.role ?? null,
      category,
      summary,
    },
    ...entries,
  ];
}
