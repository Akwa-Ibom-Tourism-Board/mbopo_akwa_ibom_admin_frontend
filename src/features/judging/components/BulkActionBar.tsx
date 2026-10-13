import { useState } from "react";
import { toast } from "sonner";
import { UserX } from "lucide-react";
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
import { DISQUALIFICATION_REASONS } from "../types";
import { useDisqualify } from "../api/hooks";

// Rendered inside the stage table's bulk bar: disqualify the selected
// candidates, individually or in bulk. Disqualification is for breaking a
// rule and always needs a reason; "who goes through" is the Head Judge's
// finalize step, not a bulk action here.
export function BulkActionBar({
  selected,
  clear,
}: {
  selected: Candidate[];
  clear: () => void;
}) {
  const disqualify = useDisqualify();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const n = selected.length;

  return (
    <>
      <Button size="sm" variant="destructive" onClick={() => setOpen(true)}>
        <UserX size={16} /> Disqualify {n}
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Disqualify ${n} candidate${n === 1 ? "" : "s"}?`}
        description="This is a recorded decision for breaking a rule. A reason is required."
        destructive
        confirmLabel="Disqualify"
        confirmDisabled={!reason}
        loading={disqualify.isPending}
        onConfirm={() =>
          disqualify.mutate(
            {
              ids: selected.map((c) => c.id),
              reason: note.trim() ? `${reason} — ${note.trim()}` : reason,
            },
            {
              onSuccess: () => {
                toast.success(`${n} disqualified`);
                setOpen(false);
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
