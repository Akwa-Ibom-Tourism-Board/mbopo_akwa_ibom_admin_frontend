import { useActivity } from "@/features/activity-log";
import { usePhaseStates } from "@/features/stages/api/hooks";
import { PHASES, phaseTitle, type PhaseId } from "@/lib/phases";
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

// The stage currently open for judging, or — if none is — the next one waiting
// to be opened. Carries no scores, so any role can call it.
export function useCurrentStage() {
  const { data } = usePhaseStates();
  if (!data) return undefined;
  const open = data.find((s) => s.status === "open");
  const next = data.find((s) => s.status === "pending");
  const state = open ?? next;
  if (!state)
    return {
      id: PHASES[PHASES.length - 1]!.id as PhaseId,
      title: "All stages closed",
      status: "closed" as const,
    };
  return {
    id: state.phaseId,
    title: phaseTitle(state.phaseId),
    status: state.status,
    resultsSubmitted: !!state.resultsSubmittedAt,
  };
}
