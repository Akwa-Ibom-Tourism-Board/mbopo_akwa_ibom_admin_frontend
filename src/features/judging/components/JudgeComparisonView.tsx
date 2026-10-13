import styled from "styled-components";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui";
import { Badge } from "@/shared/components";
import type { Judge, LeaderboardEntry, StageConfig } from "../types";
import { formatScore } from "../utils/scoring";

const Scroll = styled.div`
  overflow-x: auto;
`;

const T = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;

  th,
  td {
    padding: 8px 10px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    text-align: left;
    white-space: nowrap;
  }

  th {
    color: ${({ theme }) => theme.colors.muted.foreground};
    font-weight: 700;
  }
`;

// Per-judge, per-round breakdown for one candidate — the "see other judges
// and their scoring" requirement. Rendered only from the judges-only
// leaderboard route.
export function JudgeComparisonView({
  entry,
  judges,
  stage,
  onClose,
}: {
  entry: LeaderboardEntry | null;
  judges: Judge[];
  stage: StageConfig;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!entry} onOpenChange={(o) => !o && onClose()}>
      <DialogContent style={{ maxWidth: 760 }}>
        <DialogHeader>
          <DialogTitle>{entry?.candidate.name}</DialogTitle>
          <DialogDescription>
            {entry?.candidate.lga} · {stage.name}. Submitted scores only
            (average of criteria, out of 10).
          </DialogDescription>
        </DialogHeader>
        {entry && (
          <Scroll>
            <T>
              <thead>
                <tr>
                  <th>Round</th>
                  {judges.map((j) => (
                    <th key={j.id}>{j.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stage.rounds.map((r) => (
                  <tr key={r.id}>
                    <td>
                      {r.code} · {r.name}
                    </td>
                    {judges.map((j) => (
                      <td key={j.id}>
                        {formatScore(entry.perRound[r.id]?.[j.id])}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <th>Stage score</th>
                  {judges.map((j) => (
                    <th key={j.id}>
                      {formatScore(entry.perJudge[j.id]?.score)}
                    </th>
                  ))}
                </tr>
              </tbody>
            </T>
            <p style={{ marginTop: 12 }}>
              Overall average:{" "}
              <Badge $tone="primary">{formatScore(entry.average)}</Badge>
            </p>
          </Scroll>
        )}
      </DialogContent>
    </Dialog>
  );
}
