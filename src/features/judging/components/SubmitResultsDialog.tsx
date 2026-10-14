import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import styled from "styled-components";
import { Checkbox } from "@/shared/ui";
import { ConfirmDialog } from "@/shared/components";
import { inField } from "@/features/stages/utils/participants";
import { phaseTitle, type PhaseId } from "@/lib/phases";
import { PHASE_QUOTA } from "../data/mock-stages";
import {
  useResultsStandings,
  useSubmitResults,
  useSubmitResultsAndClose,
} from "../api/hooks";
import type { LeaderboardEntry } from "../types";
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
    position: sticky;
    top: 0;
    background: ${({ theme }) => theme.colors.card};
    color: ${({ theme }) => theme.colors.muted.foreground};
  }
`;

const Scroll = styled.div`
  max-height: 44vh;
  overflow: auto;
`;

const Note = styled.p<{ $warn?: boolean }>`
  margin: 0 0 10px;
  color: ${({ theme, $warn }) =>
    $warn ? theme.colors.destructive.DEFAULT : theme.colors.muted.foreground};
  font-size: 0.8125rem;
  font-weight: ${({ $warn }) => ($warn ? 600 : 400)};
`;

// Suggested selection the Head Judge can change freely: the top scorers per
// LGA up to its quota (Local Government 3, Senatorial 1); in a Grand Finale
// round the top half, or the single leader in the last round.
function suggest(phase: PhaseId, standings: LeaderboardEntry[]) {
  const quota = PHASE_QUOTA[phase];
  const picked = new Set<string>();
  if (quota) {
    const perLga = new Map<string, number>();
    for (const e of standings) {
      const n = perLga.get(e.candidate.lga) ?? 0;
      if (n < quota) {
        picked.add(e.candidate.id);
        perLga.set(e.candidate.lga, n + 1);
      }
    }
    return picked;
  }
  const keep =
    phase === "gf-r5" ? 1 : Math.max(1, Math.ceil(standings.length / 2));
  standings.slice(0, keep).forEach((e) => picked.add(e.candidate.id));
  return picked;
}

// Submit results: every judge's scores are added up and ranked, and whoever is
// submitting (the Head Judge, or the Super Admin) ticks who goes through.
// Submitting locks the scores; with `andClose` (Super Admin only) the stage is
// closed in the same step.
export function SubmitResultsDialog({
  phaseId,
  open,
  onOpenChange,
  andClose = false,
}: {
  phaseId: PhaseId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  andClose?: boolean;
}) {
  const board = useResultsStandings(phaseId, open);
  const submit = useSubmitResults(phaseId);
  const submitAndClose = useSubmitResultsAndClose(phaseId);
  const finalize = andClose ? submitAndClose : submit;
  const quota = PHASE_QUOTA[phaseId];
  const finalRound = phaseId === "gf-r5";

  const standings = useMemo(
    () =>
      (board.data ?? [])
        .filter((e) => inField(e.candidate, phaseId))
        .sort((a, b) => (b.total ?? -1) - (a.total ?? -1)),
    [board.data, phaseId],
  );
  const [passed, setPassed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) setPassed(suggest(phaseId, standings));
  }, [open, phaseId, standings]);

  const overQuota = useMemo(() => {
    if (!quota) return [];
    const counts = new Map<string, number>();
    standings.forEach((e) => {
      if (passed.has(e.candidate.id)) {
        counts.set(e.candidate.lga, (counts.get(e.candidate.lga) ?? 0) + 1);
      }
    });
    return [...counts].filter(([, n]) => n > quota).map(([lga]) => lga);
  }, [standings, passed, quota]);

  const noCut =
    !finalRound && phaseId.startsWith("gf-") && passed.size >= standings.length;
  const invalid =
    passed.size === 0 ||
    overQuota.length > 0 ||
    noCut ||
    (finalRound && passed.size !== 1);

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        finalRound
          ? `Submit the winner${andClose ? " and close" : ""}`
          : `Submit results — ${phaseTitle(phaseId)}${andClose ? " and close" : ""}`
      }
      description={
        finalRound
          ? `Every judge's scores are added up below. Choose the single winner. Scores lock${andClose ? " and the stage closes" : ", then the stage can be closed"}.`
          : `Every judge's scores are added up below. Tick who goes through; everyone else still competing is eliminated. Scores lock${andClose ? " and the stage closes" : ", then the stage can be closed"}. This can't be undone.`
      }
      confirmLabel={
        andClose
          ? "Submit results & close"
          : finalRound
            ? "Submit winner"
            : "Submit results"
      }
      destructive={!finalRound}
      wide
      confirmDisabled={invalid || board.isLoading}
      loading={finalize.isPending}
      onConfirm={() =>
        finalize.mutate([...passed], {
          onSuccess: (r) => {
            toast.success(
              finalRound
                ? andClose
                  ? "Winner submitted — stage closed"
                  : "Winner submitted"
                : `${andClose ? "Results submitted and stage closed" : "Results submitted"} — ${r.through} through, ${r.eliminated} eliminated`,
            );
            onOpenChange(false);
          },
          onError: (e) => toast.error(e.message),
        })
      }
    >
      {overQuota.length > 0 && (
        <Note $warn>
          Over the limit of {quota} per LGA in: {overQuota.join(", ")}.
        </Note>
      )}
      {noCut && (
        <Note $warn>A round has to eliminate at least one candidate.</Note>
      )}
      <Note>
        {passed.size} of {standings.length} going through
        {quota ? ` — at most ${quota} per LGA` : ""}
        {finalRound ? " — exactly one winner" : ""}.
      </Note>
      <Scroll>
        <Table>
          <thead>
            <tr>
              <th aria-label="Goes through" />
              <th>#</th>
              <th>Candidate</th>
              <th>LGA</th>
              <th>Total</th>
              <th>Average</th>
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
                        const next = new Set(finalRound ? [] : prev);
                        if (v === true) next.add(e.candidate.id);
                        else next.delete(e.candidate.id);
                        return next;
                      })
                    }
                  />
                </td>
                <td>{i + 1}</td>
                <td>
                  <strong>{e.candidate.name}</strong>
                </td>
                <td>{e.candidate.lga}</td>
                <td>
                  <strong>{formatScore(e.total)}</strong>
                </td>
                <td>{formatScore(e.average)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Scroll>
    </ConfirmDialog>
  );
}
