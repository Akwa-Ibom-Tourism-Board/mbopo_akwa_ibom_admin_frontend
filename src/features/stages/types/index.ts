import type { PhaseId } from "@/lib/phases";
import type { Role } from "@/lib/rbac";

// pending → open (an Admin / Super Admin opens it) → closed (the Head Judge
// finalizes it). Closed is final: nobody changes a closed stage's scores.
export type PhaseStatus = "pending" | "open" | "closed";

export interface PhaseState {
  phaseId: PhaseId;
  status: PhaseStatus;
  openedAt?: string;
  openedBy?: string;
  // Kept so the page can show "an administrator" instead of a Super Admin's
  // name to everyone who isn't the Super Admin.
  openedByRole?: Role;
  closedAt?: string;
  closedBy?: string;
  closedByRole?: Role;
  // Results (who goes through) are submitted before the stage is closed. Once
  // submitted, scoring is locked; the stage stays "open" until it is closed.
  resultsSubmittedAt?: string;
  resultsSubmittedBy?: string;
  resultsSubmittedByRole?: Role;
  reopenedAt?: string;
  reopenedBy?: string;
  reopenedByRole?: Role;
  // Candidate ids the results sent through (set when results are submitted).
  passedIds?: string[];
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
