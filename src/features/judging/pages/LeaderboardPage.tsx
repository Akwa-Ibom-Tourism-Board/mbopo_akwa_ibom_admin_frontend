import { useState } from "react";
import { EmptyState, PageHeader } from "@/shared/components";
import { usePhaseStates } from "@/features/stages/api/hooks";
import { phaseTitle, type PhaseId } from "@/lib/phases";
import { JudgeComparisonView } from "../components/JudgeComparisonView";
import { LeaderboardTable } from "../components/LeaderboardTable";
import { PhasePicker } from "../components/PhasePicker";
import { roundsOf } from "../data/mock-stages";
import { useJudges, useLeaderboard } from "../api/hooks";
import type { LeaderboardEntry } from "../types";

// Judges-only. The route is wrapped in RoleGuard("judging.leaderboard"), so
// this component — and therefore the queries below — never mounts for any
// other role. (UI-level only; the backend must enforce it independently.)
// Judges can read every judge's submitted scores here but change only their
// own, on the scoring screen.
export function LeaderboardPage() {
  const states = usePhaseStates().data;
  const [phase, setPhase] = useState<PhaseId>(
    () => "lga", // refined below once stage states load
  );
  const [chosen, setChosen] = useState(false);
  // Default to the open stage once we know which it is.
  const open = states?.find((s) => s.status === "open")?.phaseId;
  const active = chosen ? phase : (open ?? phase);

  const board = useLeaderboard(active);
  const judges = useJudges(active);
  const [selected, setSelected] = useState<LeaderboardEntry | null>(null);
  const pending =
    states?.find((s) => s.phaseId === active)?.status === "pending";

  return (
    <>
      <PageHeader
        title="Leaderboard"
        description="Every judge's score per candidate and the added-up total. Visible to judges only. Select a row for the per-round breakdown."
        actions={
          <PhasePicker
            value={active}
            onChange={(p) => {
              setPhase(p);
              setChosen(true);
            }}
          />
        }
      />
      {pending ? (
        <EmptyState>
          {phaseTitle(active)} hasn't been opened yet, so there are no scores.
        </EmptyState>
      ) : (
        <LeaderboardTable
          entries={board.data}
          judges={judges.data ?? []}
          isLoading={board.isLoading || judges.isLoading}
          onSelect={setSelected}
        />
      )}
      <JudgeComparisonView
        entry={selected}
        judges={judges.data ?? []}
        rounds={roundsOf(active)}
        title={phaseTitle(active)}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
