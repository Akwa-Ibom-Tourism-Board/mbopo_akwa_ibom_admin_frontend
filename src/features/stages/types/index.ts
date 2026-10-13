import type { PhaseId } from "@/lib/phases";

// pending → open (an Admin / Super Admin opens it) → closed (the Head Judge
// finalizes it). Closed is final: nobody changes a closed stage's scores.
export type PhaseStatus = "pending" | "open" | "closed";

export interface PhaseState {
  phaseId: PhaseId;
  status: PhaseStatus;
  openedAt?: string;
  openedBy?: string;
  closedAt?: string;
  closedBy?: string;
  // Candidate ids the Head Judge finalized through (set when closed).
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
