import { useState } from "react";
import styled from "styled-components";
import { DoorOpen, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui";
import { ConfirmDialog } from "@/shared/components";
import { formatDateTime } from "@/lib/formatting";
import {
  getPhaseDef,
  phaseTitle,
  prevPhaseId,
  type PhaseId,
} from "@/lib/phases";
import { useCan } from "@/lib/rbac";
import { useOpenPhase } from "../api/hooks";
import type { PhaseState } from "../types";
import { PhaseStatusBadge } from "./PhaseStatusBadge";

const Card = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 24px;
  margin-bottom: 20px;
  padding: 18px 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.card};
`;

const Main = styled.div`
  flex: 1 1 320px;
  min-width: 0;

  h2 {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin: 0 0 6px;
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 1.5rem;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.muted.foreground};
    font-size: 0.875rem;
  }
`;

const Meta = styled.p`
  margin-top: 8px !important;
  font-size: 0.8125rem !important;
`;

const Hint = styled.p`
  display: flex;
  gap: 8px;
  flex: 1 1 100%;
  margin: 0;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.8125rem;
`;

// Header of a stage page: what the stage is, whether it's pending / open /
// closed, and — for Admin and Super Admin only — the button that opens it.
// Judges can close a stage out but never open one.
export function StageHeader({
  phaseId,
  state,
  summary,
  incoming,
  prevClosed,
}: {
  phaseId: PhaseId;
  state: PhaseState;
  summary: string;
  incoming: number;
  prevClosed: boolean;
}) {
  const can = useCan();
  const open = useOpenPhase();
  const [confirm, setConfirm] = useState(false);
  const prev = prevPhaseId(phaseId);
  const canOpenNow = state.status === "pending" && prevClosed;

  return (
    <Card>
      <Main>
        <h2>
          {phaseTitle(phaseId)} <PhaseStatusBadge status={state.status} />
        </h2>
        <p>{summary}</p>
        {state.openedAt && (
          <Meta>
            Opened {formatDateTime(state.openedAt)}
            {state.openedBy ? ` by ${state.openedBy}` : ""}
            {state.closedAt
              ? ` · Closed ${formatDateTime(state.closedAt)}${state.closedBy ? ` by ${state.closedBy}` : ""}`
              : ""}
          </Meta>
        )}
      </Main>

      {can("stages.open") && state.status === "pending" && (
        <Button disabled={!canOpenNow} onClick={() => setConfirm(true)}>
          <DoorOpen size={16} /> Open {getPhaseDef(phaseId).label}
        </Button>
      )}

      {state.status === "pending" &&
        can("stages.open") &&
        !canOpenNow &&
        prev && (
          <Hint>
            <Lock size={14} style={{ flexShrink: 0, marginTop: 2 }} />
            {phaseTitle(prev)} has to be closed by the Head Judge before this
            stage can be opened.
          </Hint>
        )}
      {state.status === "pending" && !can("stages.open") && (
        <Hint>
          <Lock size={14} style={{ flexShrink: 0, marginTop: 2 }} />
          Only an Admin can open a stage.
        </Hint>
      )}

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={`Open ${phaseTitle(phaseId)}?`}
        description={
          prev
            ? `${incoming} candidate${incoming === 1 ? "" : "s"} finalized through ${phaseTitle(prev)} will move into this stage and judges can start scoring.`
            : "Judges can start scoring."
        }
        confirmLabel="Open stage"
        loading={open.isPending}
        onConfirm={() =>
          open.mutate(phaseId, {
            onSuccess: () => {
              toast.success(`${phaseTitle(phaseId)} is open`);
              setConfirm(false);
            },
            onError: (e) => {
              toast.error(e.message);
              setConfirm(false);
            },
          })
        }
      />
    </Card>
  );
}
