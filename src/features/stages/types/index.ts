import type { PhaseId } from "@/lib/phases";
import type { Role } from "@/lib/rbac";

// pending → open (an Admin / Super Admin opens it) → closed (the Head Judge
// finalizes it). Closed is final: nobody changes a closed stage's scores.
export type PhaseStatus = "pending" | "open" | "closed";

// Who performed an opened/closed/submitted/reopened action — resolved
// server-side from the raw actor id (see backend's phase-state.helpers.ts
// serializePhaseStates), never denormalized into the row itself.
export interface PhaseActor {
  id: string;
  name: string;
  role: Role;
}

export interface PhaseState {
  phaseId: PhaseId;
  status: PhaseStatus;
  openedAt?: string | null;
  openedBy?: PhaseActor | null;
  closedAt?: string | null;
  closedBy?: PhaseActor | null;
  // Judges whose scores count in this stage's results, fixed when it is closed
  // — deactivating a judge later changes nothing about a closed stage.
  countedJudgeIds?: string[] | null;
  // Results (who goes through) are submitted before the stage is closed. Once
  // submitted, scoring is locked; the stage stays "open" until it is closed.
  resultsSubmittedAt?: string | null;
  resultsSubmittedBy?: PhaseActor | null;
  reopenedAt?: string | null;
  reopenedBy?: PhaseActor | null;
  // Candidate ids the results sent through (set when results are submitted).
  passedIds?: string[] | null;
}

// How a candidate relates to a given stage.
export type Outcome =
  | "incoming" // finalized through the previous stage, waiting for this one to open
  | "competing"
  | "advanced"
  | "eliminated"
  | "disqualified"
  | "winner";

export const OUTCOME_LABELS: Record<Outcome, string> = {
  incoming: "Awaiting opening",
  competing: "Competing",
  advanced: "Advanced",
  eliminated: "Eliminated here",
  disqualified: "Disqualified",
  winner: "Winner",
};
