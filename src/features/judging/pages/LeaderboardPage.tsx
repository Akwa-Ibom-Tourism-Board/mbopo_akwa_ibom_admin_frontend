import { useState } from "react";
import { PageHeader } from "@/shared/components";
import type { CandidateStage } from "@/features/candidates/types";
import { JudgeComparisonView } from "../components/JudgeComparisonView";
import { LeaderboardTable } from "../components/LeaderboardTable";
import { StagePicker } from "../components/StagePicker";
import { getStageConfig } from "../data/mock-stages";
import { useJudges, useLeaderboard } from "../api/hooks";
import type { LeaderboardEntry } from "../types";

// Judges-only. The route is wrapped in RoleGuard("judging.leaderboard"), so
// this component — and therefore the queries below — never mounts for any
// other role. (UI-level only; the backend must enforce it independently.)
export function LeaderboardPage() {
  const [stage, setStage] = useState<CandidateStage>("lga_selection");
  const board = useLeaderboard(stage);
  const judges = useJudges();
  const [open, setOpen] = useState<LeaderboardEntry | null>(null);

  return (
    <>
      <PageHeader
        title="Leaderboard"
        description="Every judge's stage score per candidate, and the overall average. Visible to judges only. Select a row for the per-round breakdown."
        actions={<StagePicker value={stage} onChange={setStage} />}
      />
      <LeaderboardTable
        entries={board.data}
        judges={judges.data ?? []}
        isLoading={board.isLoading || judges.isLoading}
        onSelect={setOpen}
      />
      <JudgeComparisonView
        entry={open}
        judges={judges.data ?? []}
        stage={getStageConfig(stage)}
        onClose={() => setOpen(null)}
      />
    </>
  );
}
