import styled from "styled-components";
import { Lock, LockOpen, Scissors } from "lucide-react";
import { Button } from "@/shared/ui";
import { Badge } from "@/shared/components";
import type { Candidate } from "@/features/candidates/types";
import type { RoundClosure, StageConfig } from "../types";
import { currentRoundIndex, fieldForRound } from "../utils/rounds";

const Strip = styled.ol`
  display: flex;
  gap: 10px;
  margin: 0 0 20px;
  padding: 0 0 4px;
  list-style: none;
  overflow-x: auto;
`;

const Step = styled.li<{ $current: boolean; $closed: boolean }>`
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 8px;
  width: 210px;
  padding: 12px 14px;
  border: 1.5px solid
    ${({ theme, $current }) => ($current ? theme.colors.primary.DEFAULT : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme, $closed }) =>
    $closed ? theme.colors.muted.DEFAULT : theme.colors.card};
  font-size: 0.8125rem;
`;

const Name = styled.strong`
  font-size: 0.875rem;
  line-height: 1.3;
`;

// One chip per round showing where the stage is. Elimination stages run the
// rounds in order and each close is a cut; cumulative stages can run rounds in
// any order and closing just locks the scores.
export function RoundTracker({
  config,
  closures,
  candidates,
  onClose,
  onReopen,
}: {
  config: StageConfig;
  closures: RoundClosure[];
  candidates: Candidate[];
  onClose: (roundIndex: number) => void;
  onReopen: (roundId: string) => void;
}) {
  const elimination = config.mode === "elimination";
  const current = currentRoundIndex(config, closures);

  return (
    <Strip aria-label="Rounds">
      {config.rounds.map((r, i) => {
        const closure = closures.find((c) => c.roundId === r.id);
        const closed = !!closure;
        const isCurrent = elimination ? i === current : !closed;
        const inRound = fieldForRound(config, i, candidates).length;
        const canClose = elimination ? i === current : !closed;

        return (
          <Step key={r.id} $current={isCurrent && elimination} $closed={closed}>
            <Name>
              {r.code} · {r.name.replace(/^Round \d — /, "")}
            </Name>
            <div>
              {closed ? (
                <Badge $tone="neutral">
                  <Lock size={12} style={{ marginRight: 4 }} />
                  {elimination
                    ? `Closed · ${closure.passedIds?.length ?? 0} through`
                    : "Closed"}
                </Badge>
              ) : elimination && !isCurrent ? (
                <Badge $tone="neutral">Waiting</Badge>
              ) : (
                <Badge $tone="primary">
                  {elimination ? "In progress" : "Open"}
                </Badge>
              )}
            </div>
            <span>{inRound} in this round</span>
            {canClose && (
              <Button size="sm" variant="outline" onClick={() => onClose(i)}>
                {elimination ? (
                  <>
                    <Scissors size={14} /> Close &amp; cut
                  </>
                ) : (
                  <>
                    <Lock size={14} /> Lock scores
                  </>
                )}
              </Button>
            )}
            {closed && !elimination && (
              <Button size="sm" variant="ghost" onClick={() => onReopen(r.id)}>
                <LockOpen size={14} /> Reopen
              </Button>
            )}
          </Step>
        );
      })}
    </Strip>
  );
}
