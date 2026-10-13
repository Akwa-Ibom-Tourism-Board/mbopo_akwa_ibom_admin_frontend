import { Navigate } from "react-router-dom";
import { usePhaseStates } from "@/features/stages/api/hooks";
import { EmptyState } from "@/shared/components";

// /judging has no page of its own any more: judges work from the stage pages.
// Send them to the stage that is open, or the first one still to open.
export function JudgingRedirect() {
  const { data } = usePhaseStates();
  if (!data) return <EmptyState>Loading…</EmptyState>;
  const target =
    data.find((s) => s.status === "open") ??
    data.find((s) => s.status === "pending") ??
    data[0]!;
  return <Navigate to={`/stages/${target.phaseId}`} replace />;
}
