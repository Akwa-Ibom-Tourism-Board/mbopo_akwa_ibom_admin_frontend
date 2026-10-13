import { useActivity } from "@/features/activity-log";
import { formatRelative } from "@/lib/formatting";

// Latest few activity entries, shaped for ActivityList. Only the Super Admin
// and Admin dashboards call this (they hold activity.view).
export function useRecentActivity(limit = 5) {
  const { data } = useActivity();
  return (data ?? []).slice(0, limit).map((e) => ({
    id: e.id,
    text: e.summary,
    when: formatRelative(e.at),
  }));
}

export const count = (n: number | undefined) => (n == null ? "—" : n);
