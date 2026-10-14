import { useState } from "react";
import styled from "styled-components";
import { DoorOpen, Lock, RotateCcw } from "lucide-react";
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
import { useAuth } from "@/features/auth";
import { useReopenStage } from "@/features/judging/api/hooks";
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
  laterClosed,
  wipes,
}: {
  phaseId: PhaseId;
  state: PhaseState;
  summary: string;
  incoming: number;
  prevClosed: boolean;
  // Any later stage already closed (the event has moved on)?
  laterClosed: boolean;
  // Later stages that have been opened — reopening this one erases them.
  wipes: PhaseId[];
}) {
  const can = useCan();
  const open = useOpenPhase();
  const reopen = useReopenStage();
  const { role } = useAuth();
  const [reopenConfirm, setReopenConfirm] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const prev = prevPhaseId(phaseId);
  const canOpenNow = state.status === "pending" && prevClosed;
  // An Admin can reopen only the most recently closed stage; the Super Admin
  // can reopen any closed stage.
  const canReopenNow = can("stages.reopenAny") || !laterClosed;
  // Everyone but the Super Admin sees a Super Admin's actions as "an
  // administrator" — they simply don't know that role exists.
  const who = (name: string | undefined, by: string | undefined) =>
    !name
      ? ""
      : ` by ${by === "super_admin" && role !== "super_admin" ? "an administrator" : name}`;

  return (
    <Card>
      <Main>
        <h2>
          {phaseTitle(phaseId)}{" "}
          <PhaseStatusBadge
            status={state.status}
            resultsSubmitted={!!state.resultsSubmittedAt}
          />
        </h2>
        <p>{summary}</p>
        {state.openedAt && (
          <Meta>
            Opened {formatDateTime(state.openedAt)}
            {who(state.openedBy, state.openedByRole)}
            {state.reopenedAt
              ? ` · Reopened ${formatDateTime(state.reopenedAt)}${who(state.reopenedBy, state.reopenedByRole)}`
              : ""}
            {state.resultsSubmittedAt
              ? ` · Results submitted ${formatDateTime(state.resultsSubmittedAt)}${who(state.resultsSubmittedBy, state.resultsSubmittedByRole)}`
              : ""}
            {state.closedAt
              ? ` · Closed ${formatDateTime(state.closedAt)}${who(state.closedBy, state.closedByRole)}`
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
      {state.status === "closed" && can("stages.open") && (
        <Button
          variant="outline"
          disabled={!canReopenNow}
          onClick={() => setReopenConfirm(true)}
        >
          <RotateCcw size={16} /> Reopen {getPhaseDef(phaseId).label}
        </Button>
      )}
      {state.status === "closed" && can("stages.open") && !canReopenNow && (
        <Hint>
          <Lock size={14} style={{ flexShrink: 0, marginTop: 2 }} />
          The event has moved on, so this stage can't be reopened.
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
      <ConfirmDialog
        open={reopenConfirm}
        onOpenChange={setReopenConfirm}
        title={`Reopen ${phaseTitle(phaseId)}?`}
        description={
          <>
            Judges will be able to change their scores for this stage again, and
            the Head Judge's decision is undone — candidates who went through or
            were cut come back into the stage.
            {wipes.length > 0 && (
              <strong style={{ display: "block", marginTop: 10 }}>
                Everything in {wipes.map(phaseTitle).join(", ")} will be erased
                — scores, movements and disqualifications — and
                {wipes.length === 1 ? " it goes" : " they go"} back to "not
                opened yet". This can't be undone.
              </strong>
            )}
          </>
        }
        confirmLabel="Reopen stage"
        destructive={wipes.length > 0}
        loading={reopen.isPending}
        onConfirm={() =>
          reopen.mutate(phaseId, {
            onSuccess: () => {
              toast.success(`${phaseTitle(phaseId)} is open again`);
              setReopenConfirm(false);
            },
            onError: (e) => {
              toast.error(e.message);
              setReopenConfirm(false);
            },
          })
        }
      />
    </Card>
  );
}
