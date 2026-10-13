import { useState } from "react";
import styled from "styled-components";
import { CheckCircle2, Clock, Gavel } from "lucide-react";
import { Button } from "@/shared/ui";
import { Badge } from "@/shared/components";
import { phaseTitle, type PhaseId } from "@/lib/phases";
import { useCan } from "@/lib/rbac";
import { useFinalizeStatus } from "../api/hooks";
import { FinalizeDialog } from "./FinalizeDialog";

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

// Judges-only block on an open stage's page: how far each judge has got, and —
// for the Head Judge alone — the button that finalizes and closes the stage
// once every judge has finished.
export function FinalizePanel({ phaseId }: { phaseId: PhaseId }) {
  const can = useCan();
  const status = useFinalizeStatus(phaseId);
  const [open, setOpen] = useState(false);
  const data = status.data;
  if (!data) return null;

  const finished = data.judges.filter((j) => j.outstanding === 0).length;

  return (
    <Card>
      <Row>
        <h3>
          {data.ready ? <CheckCircle2 size={18} /> : <Clock size={18} />}
          {data.ready
            ? "Every judge has voted"
            : `${finished} of ${data.judges.length} judges have finished scoring`}
        </h3>
        {can("judging.finalize") && (
          <Button disabled={!data.ready} onClick={() => setOpen(true)}>
            <Gavel size={16} /> Finalize &amp; close stage
          </Button>
        )}
      </Row>
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
      <Hint>
        {can("judging.finalize")
          ? data.ready
            ? `Add up the scores and close ${phaseTitle(phaseId)} when you're ready.`
            : "You can finalize once every judge has scored every candidate."
          : "The Head Judge adds up the scores and closes the stage once every judge has voted."}
      </Hint>
      {can("judging.finalize") && (
        <FinalizeDialog phaseId={phaseId} open={open} onOpenChange={setOpen} />
      )}
    </Card>
  );
}
