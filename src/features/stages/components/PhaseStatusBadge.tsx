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

export function PhaseStatusBadge({ status }: { status: PhaseStatus }) {
  return <Badge $tone={TONE[status]}>{LABEL[status]}</Badge>;
}
