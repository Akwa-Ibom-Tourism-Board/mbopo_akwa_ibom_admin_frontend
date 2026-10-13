import type { Candidate } from "@/features/candidates/types";
import { phaseIndex, type PhaseId } from "@/lib/phases";
import type { Outcome } from "../types";

export interface Participant {
  candidate: Candidate;
  outcome: Outcome;
}

// Who appears on a stage's page, and how that stage went for them:
//  • phase before theirs        → they passed it ("advanced")
//  • their own phase            → their current standing there
//  • the next phase, finalized  → "incoming": through the previous stage and
//    waiting for this one to open
export function participantsOf(
  phaseId: PhaseId,
  candidates: Candidate[],
): Participant[] {
  const idx = phaseIndex(phaseId);
  const out: Participant[] = [];
  for (const c of candidates) {
    const ci = phaseIndex(c.phase);
    if (ci > idx) out.push({ candidate: c, outcome: "advanced" });
    else if (ci === idx) {
      out.push({
        candidate: c,
        outcome: c.status === "active" ? "competing" : c.status,
      });
    } else if (ci === idx - 1 && c.status === "advanced") {
      out.push({ candidate: c, outcome: "incoming" });
    }
  }
  return out;
}

// Candidates judges score in a stage: in it, and still competing.
export const inField = (c: Candidate, phaseId: PhaseId) =>
  c.phase === phaseId && c.status === "active";
