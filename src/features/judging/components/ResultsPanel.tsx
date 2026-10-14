import { useState } from "react";
import styled from "styled-components";
import { CheckCircle2, Clock, Gavel, Lock, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui";
import { Badge, ConfirmDialog } from "@/shared/components";
import { useAuth } from "@/features/auth";
import type { PhaseState } from "@/features/stages/types";
import { formatDateTime } from "@/lib/formatting";
import { phaseTitle, type PhaseId } from "@/lib/phases";
import { isJudgeRole, useCan } from "@/lib/rbac";
import { useCloseStage, useFinalizeStatus } from "../api/hooks";
import { SubmitResultsDialog } from "./SubmitResultsDialog";

const Card = styled.div`
  margin-bottom: 20px;
  padding: 16px 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.card};
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 1rem;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Judges = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
`;

const Hint = styled.p`
  margin: 12px 0 0;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.8125rem;
`;

// The "results" step of an open stage, for everyone who has a part in it:
//  • judges see how far each judge has got (judge roles only — it's judge data);
//  • the Head Judge submits results once every judge has voted;
//  • the Super Admin submits at any time, or submits and closes in one go;
//  • once results are in, the Head Judge, an Admin or the Super Admin can close.
// An Admin can't submit — until then they just see that results are awaited.
export function ResultsPanel({
  phaseId,
  state,
}: {
  phaseId: PhaseId;
  state: PhaseState;
}) {
  const can = useCan();
  const { role } = useAuth();
  const judge = isJudgeRole(role);
  const status = useFinalizeStatus(phaseId, judge);
  const close = useCloseStage();
  const [submitOpen, setSubmitOpen] = useState<false | "submit" | "both">(
    false,
  );
  const [closeOpen, setCloseOpen] = useState(false);

  const submitted = !!state.resultsSubmittedAt;
  const data = status.data;
  const finished = data?.judges.filter((j) => j.outstanding === 0).length ?? 0;
  const anytime = can("results.submitAnytime");
  // A Super Admin's submission shows to everyone else as an administrator's.
  const by =
    state.resultsSubmittedByRole === "super_admin" && role !== "super_admin"
      ? "an administrator"
      : state.resultsSubmittedBy;

  if (submitted) {
    return (
      <Card>
        <Row>
          <h3>
            <Lock size={18} /> Results submitted
          </h3>
          {can("stages.close") && (
            <Button onClick={() => setCloseOpen(true)}>
              <Gavel size={16} /> Close stage
            </Button>
          )}
        </Row>
        <Hint>
          Submitted {formatDateTime(state.resultsSubmittedAt!)}
          {by ? ` by ${by}` : ""}. Scores are locked.
          {can("stages.close")
            ? " Close the stage so the next one can be opened."
            : " The stage will be closed shortly."}
        </Hint>
        <ConfirmDialog
          open={closeOpen}
          onOpenChange={setCloseOpen}
          title={`Close ${phaseTitle(phaseId)}?`}
          description="The stage ends and the next one can be opened. If something needs correcting later, it can be reopened."
          confirmLabel="Close stage"
          loading={close.isPending}
          onConfirm={() =>
            close.mutate(phaseId, {
              onSuccess: () => {
                toast.success(`${phaseTitle(phaseId)} closed`);
                setCloseOpen(false);
              },
              onError: (e) => {
                toast.error(e.message);
                setCloseOpen(false);
              },
            })
          }
        />
      </Card>
    );
  }

  return (
    <Card>
      <Row>
        <h3>
          {data?.ready ? <CheckCircle2 size={18} /> : <Clock size={18} />}
          {judge && data
            ? data.ready
              ? "Every judge has voted"
              : `${finished} of ${data.judges.length} judges have finished scoring`
            : "Results not submitted yet"}
        </h3>
        <Actions>
          {can("results.submit") && (
            <Button
              disabled={!anytime && !data?.ready}
              onClick={() => setSubmitOpen("submit")}
            >
              <Send size={16} /> Submit results
            </Button>
          )}
          {anytime && (
            <Button variant="outline" onClick={() => setSubmitOpen("both")}>
              <Gavel size={16} /> Submit &amp; close
            </Button>
          )}
          {can("stages.close") && !can("results.submit") && (
            <Button variant="outline" disabled>
              <Gavel size={16} /> Close stage
            </Button>
          )}
        </Actions>
      </Row>
      {judge && data && (
        <Judges aria-label="Judges' progress">
          {data.judges.map((j) => (
            <li key={j.id}>
              <Badge $tone={j.outstanding === 0 ? "primary" : "secondary"}>
                {j.name}
                {j.head ? " (Head)" : ""}
                {j.outstanding === 0 ? " · done" : ` · ${j.outstanding} left`}
              </Badge>
            </li>
          ))}
        </Judges>
      )}
      <Hint>
        {anytime
          ? "You can submit the results at any time — you don't have to wait for the judges. Judges' scores can't be changed by anyone but the judges."
          : can("results.submit")
            ? data?.ready
              ? `Add up the scores and submit the results of ${phaseTitle(phaseId)} when you're ready.`
              : "You can submit results once every judge has scored every candidate."
            : can("stages.close")
              ? "Waiting for the Head Judge to submit the results. The stage can be closed after that."
              : "The Head Judge submits the results once every judge has voted."}
      </Hint>
      {can("results.submit") && (
        <SubmitResultsDialog
          phaseId={phaseId}
          open={!!submitOpen}
          andClose={submitOpen === "both"}
          onOpenChange={(o) => !o && setSubmitOpen(false)}
        />
      )}
    </Card>
  );
}
