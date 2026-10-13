import { useState } from "react";
import { toast } from "sonner";
import { Crown, UserCheck, UserX } from "lucide-react";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/shared/ui";
import { ConfirmDialog } from "@/shared/components";
import type { Candidate, CandidateStage } from "@/features/candidates/types";
import { DISQUALIFICATION_REASONS } from "../types";
import { useAdvance, useDisqualify } from "../api/hooks";

// Rendered inside the candidate DataTable's bulk bar: one action applied to
// every selected row, individually or in bulk (a single row works too).
export function BulkActionBar({
  selected,
  stage,
  clear,
}: {
  selected: Candidate[];
  stage: CandidateStage;
  clear: () => void;
}) {
  const advance = useAdvance(stage);
  const disqualify = useDisqualify();
  const [advanceOpen, setAdvanceOpen] = useState(false);
  const [dqOpen, setDqOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  const finale = stage === "grand_finale";
  const n = selected.length;
  const canAdvance =
    selected.every((c) => c.status === "active") && (!finale || n === 1);
  const ids = selected.map((c) => c.id);

  return (
    <>
      <Button
        size="sm"
        disabled={!canAdvance}
        onClick={() => setAdvanceOpen(true)}
      >
        {finale ? <Crown size={16} /> : <UserCheck size={16} />}
        {finale ? "Crown winner" : `Advance ${n}`}
      </Button>
      <Button size="sm" variant="destructive" onClick={() => setDqOpen(true)}>
        <UserX size={16} /> Disqualify {n}
      </Button>

      <ConfirmDialog
        open={advanceOpen}
        onOpenChange={setAdvanceOpen}
        title={
          finale
            ? "Crown this candidate as winner?"
            : `Advance ${n} candidate${n === 1 ? "" : "s"}?`
        }
        description={
          finale
            ? `${selected[0]?.name} will be recorded as the Mbopo Akwa Ibom winner.`
            : "They'll be marked as advanced and move into the next stage when it opens."
        }
        confirmLabel={finale ? "Crown winner" : "Advance"}
        loading={advance.isPending}
        onConfirm={() =>
          advance.mutate(ids, {
            onSuccess: () => {
              toast.success(finale ? "Winner recorded" : `${n} advanced`);
              setAdvanceOpen(false);
              clear();
            },
            onError: (e) => toast.error(e.message),
          })
        }
      />

      <ConfirmDialog
        open={dqOpen}
        onOpenChange={setDqOpen}
        title={`Disqualify ${n} candidate${n === 1 ? "" : "s"}?`}
        description="This is a recorded decision. A reason is required."
        destructive
        confirmLabel="Disqualify"
        confirmDisabled={!reason}
        loading={disqualify.isPending}
        onConfirm={() =>
          disqualify.mutate(
            {
              ids,
              reason: note.trim() ? `${reason} — ${note.trim()}` : reason,
            },
            {
              onSuccess: () => {
                toast.success(`${n} disqualified`);
                setDqOpen(false);
                setReason("");
                setNote("");
                clear();
              },
              onError: (e) => toast.error(e.message),
            },
          )
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger aria-label="Reason">
              <SelectValue placeholder="Choose a reason" />
            </SelectTrigger>
            <SelectContent>
              {DISQUALIFICATION_REASONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            aria-label="Additional detail"
            placeholder="Optional detail"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </ConfirmDialog>
    </>
  );
}
