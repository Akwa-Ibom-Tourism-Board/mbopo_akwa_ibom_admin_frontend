import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import { PageHeader } from "@/shared/components";
import type { CandidateStage } from "@/features/candidates/types";
import { JudgeComparisonView } from "../components/JudgeComparisonView";
import { LeaderboardTable } from "../components/LeaderboardTable";
import { StagePicker } from "../components/StagePicker";
import { getStageConfig } from "../data/mock-stages";
import { useJudges, useLeaderboard } from "../api/hooks";
import type { LeaderboardEntry } from "../types";

const ALL = "all";

// Judges-only. The route is wrapped in RoleGuard("judging.leaderboard"), so
// this component — and therefore the queries below — never mounts for any
// other role. (UI-level only; the backend must enforce it independently.)
export function LeaderboardPage() {
  const [stage, setStage] = useState<CandidateStage>("lga_selection");
  const [round, setRound] = useState(ALL);
  const config = getStageConfig(stage);
  const board = useLeaderboard(stage, round === ALL ? undefined : round);
  const judges = useJudges();
  const [open, setOpen] = useState<LeaderboardEntry | null>(null);

  return (
    <>
      <PageHeader
        title="Leaderboard"
        description="Every judge's score per candidate, and the overall average. Visible to judges only. Pick a round to see how the field stood when it was cut; select a row for the per-round breakdown."
        actions={
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <StagePicker
              value={stage}
              onChange={(s) => {
                setStage(s);
                setRound(ALL);
              }}
            />
            <Select value={round} onValueChange={setRound}>
              <SelectTrigger
                aria-label="Round"
                style={{ width: "min(100%, 260px)" }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All rounds (stage score)</SelectItem>
                {config.rounds.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.code} · {r.name.replace(/^Round \d — /, "")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
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
        stage={config}
        onClose={() => setOpen(null)}
      />
    </>
  );
}
