import { useState } from "react";
import styled from "styled-components";
import { toast } from "sonner";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import { exportParticipants, getContacts, type ContactsStatus } from "../api";
import { friendlyMessage } from "@/lib/http";

// Mirrors the 5-step list in the backend's applicant-progress.helpers.ts —
// purely a label list for this picker, not business logic.
const STEPS = [
  { step: 1, label: "Step 1 — Personal information" },
  { step: 2, label: "Step 2 — Identity & origin" },
  { step: 3, label: "Step 3 — Education & background" },
  { step: 4, label: "Step 4 — Pitch (photos & video)" },
  { step: 5, label: "Step 5 — Your story, VIN & declarations" },
] as const;

const COHORTS: { value: ContactsStatus; label: string }[] = [
  { value: "all", label: "All participants" },
  { value: "submitted", label: "Contestants (submitted)" },
  { value: "in_progress", label: "Applicants (in progress)" },
  { value: "not_started", label: "Not started" },
];

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;

  label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.muted.foreground};
  }
`;

async function copyToClipboard(values: string[], label: string) {
  if (values.length === 0) {
    toast.error(`No ${label} to copy for this filter.`);
    return;
  }
  try {
    await navigator.clipboard.writeText(values.join("\n"));
    toast.success(
      `Copied ${values.length.toLocaleString()} ${label}${values.length === 1 ? "" : "s"}.`,
    );
  } catch {
    toast.error(`Couldn't copy — try again.`);
  }
}

export function CopyContactsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<ContactsStatus>("all");
  const [step, setStep] = useState<number | undefined>(undefined);
  const [pending, setPending] = useState<"emails" | "phones" | "excel" | null>(
    null,
  );

  const run = async (kind: "emails" | "phones") => {
    setPending(kind);
    try {
      const result = await getContacts({
        status,
        step: status === "in_progress" ? step : undefined,
      });
      await copyToClipboard(
        result[kind],
        kind === "emails" ? "email" : "phone number",
      );
    } catch {
      toast.error("Couldn't fetch contacts — try again.");
    } finally {
      setPending(null);
    }
  };

  const runExport = async () => {
    setPending("excel");
    try {
      await exportParticipants(status);
    } catch (error) {
      toast.error(
        friendlyMessage(error, "Couldn't download the file — try again."),
      );
    } finally {
      setPending(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent style={{ maxWidth: 640 }}>
        <DialogHeader>
          <DialogTitle>Contacts &amp; export</DialogTitle>
          <DialogDescription>
            Copy every matching email address or phone number to your clipboard,
            or download the full details as an Excel file.
          </DialogDescription>
        </DialogHeader>

        <Field>
          <label htmlFor="copy-contacts-cohort">Who</label>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v as ContactsStatus);
              setStep(undefined);
            }}
          >
            <SelectTrigger id="copy-contacts-cohort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COHORTS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {status === "in_progress" && (
          <Field>
            <label htmlFor="copy-contacts-step">
              Stuck at (optional — leave as "Any step" for all of them; the
              Excel download always covers the whole cohort, not just this step)
            </label>
            <Select
              value={step ? String(step) : "any"}
              onValueChange={(v) =>
                setStep(v === "any" ? undefined : Number(v))
              }
            >
              <SelectTrigger id="copy-contacts-step">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any step</SelectItem>
                {STEPS.map((s) => (
                  <SelectItem key={s.step} value={String(s.step)}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => void runExport()}
            disabled={!!pending}
          >
            {pending === "excel" ? "Downloading…" : "Download Excel"}
          </Button>
          <Button
            variant="outline"
            onClick={() => void run("phones")}
            disabled={!!pending}
          >
            {pending === "phones" ? "Copying…" : "Copy phone numbers"}
          </Button>
          <Button onClick={() => void run("emails")} disabled={!!pending}>
            {pending === "emails" ? "Copying…" : "Copy emails"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
