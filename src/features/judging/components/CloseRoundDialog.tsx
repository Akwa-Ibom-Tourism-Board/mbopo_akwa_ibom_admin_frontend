import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import styled from "styled-components";
import { Checkbox } from "@/shared/ui";
import { ConfirmDialog } from "@/shared/components";
import type { Round, StageConfig } from "../types";
import { useCloseRound, useJudges, useLeaderboard } from "../api/hooks";
import { formatScore } from "../utils/scoring";

const Table = styled.table`
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
  }
`;

const Scroll = styled.div`
  max-height: 46vh;
  overflow: auto;
`;

const Note = styled.p<{ $warn?: boolean }>`
  margin: 0 0 10px;
  color: ${({ theme, $warn }) =>
    $warn ? theme.colors.destructive.DEFAULT : theme.colors.muted.foreground};
  font-size: 0.8125rem;
  font-weight: ${({ $warn }) => ($warn ? 600 : 400)};
`;

// Closes a round. Cumulative stage: just locks scores. Grand Finale: shows the
// round's standings (every judge's score) and lets the judges choose who goes
// through — everyone else in the field is eliminated. Judges-only.
export function CloseRoundDialog({
  config,
  round,
  open,
  onOpenChange,
}: {
  config: StageConfig;
  round: Round | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const elimination = config.mode === "elimination";
  const close = useCloseRound();
  const judges = useJudges().data ?? [];
  const board = useLeaderboard(
    config.id,
    elimination && open ? round?.id : undefined,
  );
  const last = round
    ? config.rounds[config.rounds.length - 1]?.id === round.id
    : false;

  const standings = useMemo(
    () =>
      (board.data ?? [])
        .filter(
          (e) =>
            e.candidate.status !== "disqualified" && !e.candidate.eliminatedAt,
        )
        .sort((a, b) => (b.average ?? -1) - (a.average ?? -1)),
    [board.data],
  );
  const [passed, setPassed] = useState<Set<string>>(new Set());

  // Suggest the top half (or the single leader in the last round); judges can
  // change it freely.
  useEffect(() => {
    if (!open || !elimination) return;
    const keep = last ? 1 : Math.max(1, Math.ceil(standings.length / 2));
    setPassed(new Set(standings.slice(0, keep).map((e) => e.candidate.id)));
  }, [open, elimination, last, standings]);

  if (!round) return null;

  const incomplete = standings.filter((e) =>
    judges.some((j) => e.perJudge[j.id] == null),
  ).length;
  const invalid =
    elimination &&
    (passed.size === 0 ||
      (last ? passed.size !== 1 : passed.size >= standings.length));

  const submit = () =>
    close.mutate(
      { roundId: round.id, passedIds: elimination ? [...passed] : undefined },
      {
        onSuccess: () => {
          toast.success(
            elimination
              ? last
                ? "Winner crowned"
                : `${round.code} closed — field cut to ${passed.size}`
              : `${round.name} locked`,
          );
          onOpenChange(false);
        },
        onError: (e) => toast.error(e.message),
      },
    );

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        elimination
          ? last
            ? `Close ${round.code} and crown the winner`
            : `Close ${round.code} and cut the field`
          : `Lock ${round.name}?`
      }
      description={
        elimination
          ? last
            ? "Choose the single winner. Scores for this round lock."
            : "Tick who goes through. Everyone else in this round is eliminated and scores for the round lock. This can't be undone."
          : "Scores for this round will be locked. You can reopen it until the stage is closed."
      }
      confirmLabel={
        elimination
          ? last
            ? "Crown winner"
            : "Close round & cut"
          : "Lock scores"
      }
      destructive={elimination && !last}
      confirmDisabled={invalid || (elimination && board.isLoading)}
      loading={close.isPending}
      onConfirm={submit}
    >
      {elimination && (
        <>
          {incomplete > 0 && (
            <Note $warn>
              {incomplete} candidate{incomplete === 1 ? "" : "s"} not yet scored
              by every judge.
            </Note>
          )}
          <Note>
            {passed.size} of {standings.length} going through
            {last ? " — exactly one winner is required." : "."}
          </Note>
          <Scroll>
            <Table>
              <thead>
                <tr>
                  <th aria-label="Goes through" />
                  <th>#</th>
                  <th>Candidate</th>
                  {judges.map((j) => (
                    <th key={j.id}>{j.name.split(" ").slice(-1)[0]}</th>
                  ))}
                  <th>Avg</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((e, i) => (
                  <tr key={e.candidate.id}>
                    <td>
                      <Checkbox
                        aria-label={`${e.candidate.name} goes through`}
                        checked={passed.has(e.candidate.id)}
                        onCheckedChange={(v) =>
                          setPassed((prev) => {
                            const next = new Set(last ? [] : prev);
                            if (v === true) next.add(e.candidate.id);
                            else next.delete(e.candidate.id);
                            return next;
                          })
                        }
                      />
                    </td>
                    <td>{i + 1}</td>
                    <td>
                      <strong>{e.candidate.name}</strong> · {e.candidate.lga}
                    </td>
                    {judges.map((j) => (
                      <td key={j.id}>{formatScore(e.perJudge[j.id]?.score)}</td>
                    ))}
                    <td>
                      <strong>{formatScore(e.average)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Scroll>
        </>
      )}
    </ConfirmDialog>
  );
}
