import { useMemo } from "react";
import styled from "styled-components";
import { EmptyState } from "@/shared/components";
import { useCandidates } from "@/features/candidates/api/hooks";
import { FinalizePanel, JudgeStageTable } from "@/features/judging";
import { STAGES, roundsOf } from "@/features/judging/data/mock-stages";
import { useCan } from "@/lib/rbac";
import { getPhaseDef, isPhaseId, phaseTitle, prevPhaseId } from "@/lib/phases";
import { useParams } from "react-router-dom";
import { usePhaseStates } from "../api/hooks";
import { StageCandidateTable } from "../components/StageCandidateTable";
import { StageHeader } from "../components/StageHeader";
import { participantsOf } from "../utils/participants";

const Rounds = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: -8px 0 20px;
  padding: 0;
  list-style: none;

  li {
    padding: 4px 12px;
    border-radius: ${({ theme }) => theme.radii.full};
    background: ${({ theme }) => theme.colors.muted.DEFAULT};
    color: ${({ theme }) => theme.colors.muted.foreground};
    font-size: 0.75rem;
    font-weight: 600;
  }
`;

// One page per stage of elimination. Every role that can see candidates sees
// the list (or an empty state); judges also get their scoring tools, and
// Admin / Super Admin get the Open button. No scores appear for non-judges.
export function StagePage() {
  const { phaseId } = useParams();
  const can = useCan();
  const states = usePhaseStates();
  const candidates = useCandidates();

  const valid = isPhaseId(phaseId);
  const rows = useMemo(
    () =>
      valid && candidates.data ? participantsOf(phaseId, candidates.data) : [],
    [valid, phaseId, candidates.data],
  );

  if (!valid) return <EmptyState>We couldn't find that stage.</EmptyState>;
  const state = states.data?.find((s) => s.phaseId === phaseId);
  if (!state || candidates.isLoading) return <EmptyState>Loading…</EmptyState>;

  const def = getPhaseDef(phaseId);
  const stageConfig = STAGES.find((s) => s.id === def.stage)!;
  const prev = prevPhaseId(phaseId);
  const prevClosed =
    !prev || states.data?.find((s) => s.phaseId === prev)?.status === "closed";
  const incoming = rows.filter((r) => r.outcome === "incoming").length;
  const rounds = roundsOf(phaseId);

  const emptyMessage =
    state.status === "pending"
      ? prev && !prevClosed
        ? `No candidates yet — they arrive once ${phaseTitle(prev)} is closed and this stage is opened.`
        : "No candidates were finalized through the previous stage."
      : state.status === "open"
        ? "No candidates are competing in this stage."
        : "No candidates took part in this stage.";

  return (
    <>
      <StageHeader
        phaseId={phaseId}
        state={state}
        summary={stageConfig.summary}
        incoming={incoming}
        prevClosed={prevClosed}
      />
      <Rounds aria-label="What is judged">
        {rounds.map((r) => (
          <li key={r.id}>
            {r.code} · {r.name.replace(/^Round \d — /, "")}
          </li>
        ))}
      </Rounds>
      {can("judging.access") && state.status === "open" && rows.length > 0 && (
        <FinalizePanel phaseId={phaseId} />
      )}
      {rows.length === 0 ? (
        <EmptyState>{emptyMessage}</EmptyState>
      ) : can("judging.access") ? (
        <JudgeStageTable phaseId={phaseId} state={state} rows={rows} />
      ) : (
        <StageCandidateTable rows={rows} />
      )}
    </>
  );
}
