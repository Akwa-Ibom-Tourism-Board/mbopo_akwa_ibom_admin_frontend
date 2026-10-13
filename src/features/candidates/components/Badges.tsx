import { Badge, type BadgeTone } from "@/shared/components";
import {
  STAGE_LABELS,
  STATUS_LABELS,
  type CandidateStage,
  type CandidateStatus,
} from "../types";

const STATUS_TONE: Record<CandidateStatus, BadgeTone> = {
  active: "neutral",
  advanced: "primary",
  eliminated: "secondary",
  disqualified: "danger",
  winner: "success",
};

export function StageBadge({ stage }: { stage: CandidateStage }) {
  return <Badge $tone="secondary">{STAGE_LABELS[stage]}</Badge>;
}

export function StatusBadge({ status }: { status: CandidateStatus }) {
  return <Badge $tone={STATUS_TONE[status]}>{STATUS_LABELS[status]}</Badge>;
}
