import { useState } from "react";
import { toast } from "sonner";
import { UserCheck, UserX } from "lucide-react";
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
import type { Candidate } from "@/features/candidates/types";
import { DISQUALIFICATION_REASONS, type StageConfig } from "../types";
import { useAdvance, useDisqualify } from "../api/hooks";

// Rendered inside the candidate DataTable's bulk bar: one action applied to
// every selected row, individually or in bulk (a single row works too).
//  • Select for next stage — cumulative stages only, with a soft warning when
//    it would exceed the document's per-LGA quota.
//  • Disqualify — every stage. A rule-breaker, not a normal cut: it needs a
//    reason. (The Grand Finale's cuts happen when a round is closed.)
export function BulkActionBar({
  selected,
  all,
  config,
  clear,
}: {
  selected: Candidate[];
  all: Candidate[]; // every candidate in the stage, for quota counting
  config: StageConfig;
  clear: () => void;
}) {
  const advance = useAdvance(config.id);
  const disqualify = useDisqualify();
  const [advanceOpen, setAdvanceOpen] = useState(false);
  const [dqOpen, setDqOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  const n = selected.length;
  const ids = selected.map((c) => c.id);
  const canAdvance =
    config.mode === "cumulative" &&
    selected.every((c) => c.status === "active");

  // LGAs that would go over the per-LGA quota.
  const over = config.perLgaQuota
    ? [...new Set(selected.map((c) => c.lga))].filter((lga) => {
        const already = all.filter(
          (c) =>
            c.lga === lga && c.status === "advanced" && !ids.includes(c.id),
        ).length;
        return (
          already + selected.filter((c) => c.lga === lga).length >
          config.perLgaQuota!
        );
      })
    : [];

  return (
    <>
      {config.mode === "cumulative" && (
        <Button
          size="sm"
          disabled={!canAdvance}
          onClick={() => setAdvanceOpen(true)}
        >
          <UserCheck size={16} /> Select {n}
        </Button>
      )}
      <Button size="sm" variant="destructive" onClick={() => setDqOpen(true)}>
        <UserX size={16} /> Disqualify {n}
      </Button>

      <ConfirmDialog
        open={advanceOpen}
        onOpenChange={setAdvanceOpen}
        title={`Select ${n} candidate${n === 1 ? "" : "s"} for the next stage?`}
        description={
          <>
            They'll be marked as selected and move on when the stage is closed.
            {over.length > 0 && (
              <strong style={{ display: "block", marginTop: 8 }}>
                Over the quota of {config.perLgaQuota} per LGA in:{" "}
                {over.join(", ")}.
              </strong>
            )}
          </>
        }
        confirmLabel="Select"
        loading={advance.isPending}
        onConfirm={() =>
          advance.mutate(ids, {
            onSuccess: () => {
              toast.success(`${n} selected`);
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
        description="This is a recorded decision for breaking a rule. A reason is required."
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
