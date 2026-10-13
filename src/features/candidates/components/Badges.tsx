import { Badge, type BadgeTone } from "@/shared/components";
import { phaseTitle, type PhaseId } from "@/lib/phases";
import { STATUS_LABELS, type CandidateStatus } from "../types";

const STATUS_TONE: Record<CandidateStatus, BadgeTone> = {
  active: "neutral",
  advanced: "primary",
  eliminated: "secondary",
  disqualified: "danger",
  winner: "success",
};

export function PhaseBadge({ phase }: { phase: PhaseId }) {
  return <Badge $tone="secondary">{phaseTitle(phase)}</Badge>;
}

export function StatusBadge({ status }: { status: CandidateStatus }) {
  return <Badge $tone={STATUS_TONE[status]}>{STATUS_LABELS[status]}</Badge>;
}
