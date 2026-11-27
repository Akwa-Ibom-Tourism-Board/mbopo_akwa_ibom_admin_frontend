import { useState } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button, Textarea } from "@/shared/ui";
import { ConfirmDialog } from "@/shared/components";
import { useSetVinReason } from "../api/hooks";

// A manual note next to an unverified (or missing) VIN — doesn't touch the
// verified/failed/not-checked state itself, just the explanatory text an
// admin sees alongside it (and the one exported in the unverified-VINs
// spreadsheet). See set-vin-reason.service.ts on the backend.
export function EditVinReasonDialog({
  candidateId,
  currentReason,
}: {
  candidateId: string;
  currentReason: string | null | undefined;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(currentReason ?? "");
  const setVinReason = useSetVinReason(candidateId);

  return (
    <>
      <Button
        type="button"
        variant="link"
        size="sm"
        style={{
          display: "inline-flex",
          height: "auto",
          padding: 0,
          marginTop: 4,
        }}
        onClick={() => {
          setReason(currentReason ?? "");
          setOpen(true);
        }}
      >
        <Pencil size={12} /> Edit note
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="VIN note"
        description="Shown to Admin, Super Admin and Judges alongside this candidate's VIN status, and included in the unverified-VINs download."
        confirmLabel="Save"
        loading={setVinReason.isPending}
        onConfirm={() =>
          setVinReason.mutate(reason.trim() || null, {
            onSuccess: () => {
              toast.success("VIN note saved");
              setOpen(false);
            },
            onError: (e) => toast.error(e.message),
          })
        }
      >
        <Textarea
          aria-label="VIN note"
          placeholder="e.g. Confirmed manually by phone — VIN belongs to the applicant"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </ConfirmDialog>
    </>
  );
}
