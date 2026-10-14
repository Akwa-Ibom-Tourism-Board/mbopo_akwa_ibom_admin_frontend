import { Badge, type BadgeTone } from "@/shared/components";
import type { PhaseStatus } from "../types";

const TONE: Record<PhaseStatus, BadgeTone> = {
  pending: "neutral",
  open: "primary",
  closed: "secondary",
};

const LABEL: Record<PhaseStatus, string> = {
  pending: "Not open yet",
  open: "Open",
  closed: "Closed",
};

export function PhaseStatusBadge({
  status,
  resultsSubmitted = false,
}: {
  status: PhaseStatus;
  // An open stage whose results are in: scoring is locked, waiting to be closed.
  resultsSubmitted?: boolean;
}) {
  if (status === "open" && resultsSubmitted) {
    return <Badge $tone="secondary">Results submitted</Badge>;
  }
  return <Badge $tone={TONE[status]}>{LABEL[status]}</Badge>;
}
