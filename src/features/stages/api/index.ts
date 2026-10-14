import { recordActivity } from "@/features/activity-log/api";
import { readSessionUser } from "@/features/auth/session";
import {
  applyJudgingDecision,
  getCandidates,
  recordCandidateEvents,
} from "@/features/candidates/api";
import { can } from "@/lib/rbac";
import {
  phaseTitle,
  prevPhaseId,
  stageOfPhase,
  type PhaseId,
} from "@/lib/phases";
import { MOCK_PHASE_STATES } from "../data/mock-phase-states";
import type { PhaseState } from "../types";

// Dummy data layer. The rules here mirror what the real backend must enforce
// on its own: only Admin / Super Admin open a stage, and only after the
// previous one is closed.
const delay = (ms = 150) => new Promise((r) => setTimeout(r, ms));

let states: PhaseState[] = MOCK_PHASE_STATES.map((s) => ({
  ...s,
  passedIds: s.passedIds ? [...s.passedIds] : undefined,
}));

const clone = (s: PhaseState): PhaseState => ({
  ...s,
  passedIds: s.passedIds ? [...s.passedIds] : undefined,
});

export async function getPhaseStates(): Promise<PhaseState[]> {
  await delay(0);
  return states.map(clone);
}

export function phaseStateSync(id: PhaseId): PhaseState {
  return clone(states.find((s) => s.phaseId === id)!);
}

// Replaces one phase's state — used by the Head Judge's finalize step.
export function setPhaseState(next: PhaseState) {
  states = states.map((s) => (s.phaseId === next.phaseId ? next : s));
}

// Opens a stage. Candidates the Head Judge finalized through the previous
// stage move into this one. Admin / Super Admin only.
export async function openPhase(id: PhaseId): Promise<{ moved: number }> {
  await delay();
  const actor = readSessionUser();
  if (!can(actor?.role, "stages.open")) {
    throw new Error("Only an Admin can open a stage.");
  }
  const state = states.find((s) => s.phaseId === id);
  if (!state || state.status !== "pending") {
    throw new Error("That stage has already been opened.");
  }
  const prev = prevPhaseId(id);
  if (prev && states.find((s) => s.phaseId === prev)?.status !== "closed") {
    throw new Error(`${phaseTitle(prev)} has to be closed first.`);
  }

  let moved = 0;
  if (prev) {
    const incoming = (await getCandidates()).filter(
      (c) => c.phase === prev && c.status === "advanced",
    );
    moved = incoming.length;
    await applyJudgingDecision(
      incoming.map((c) => c.id),
      { phase: id, stage: stageOfPhase(id), status: "active" },
    );
    recordCandidateEvents(
      incoming.map((c) => c.id),
      "judging",
      `Moved into ${phaseTitle(id)}`,
    );
  }
  setPhaseState({
    ...state,
    status: "open",
    openedAt: new Date().toISOString(),
    openedBy: actor ? `${actor.firstName} ${actor.lastName}` : undefined,
    openedByRole: actor?.role,
  });
  recordActivity(
    "judging",
    `Opened ${phaseTitle(id)}${prev ? ` with ${moved} candidate${moved === 1 ? "" : "s"}` : ""}`,
  );
  return { moved };
}
