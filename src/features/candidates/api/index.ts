import { recordActivity } from "@/features/activity-log/api";
import { MOCK_CANDIDATES } from "../data/mock-candidates";
import type { Candidate, PublicProfileUpdate } from "../types";

// Dummy data layer. Each function has the async signature a real HTTP call
// would have, so wiring the backend means replacing these bodies only — the
// components and react-query hooks above them don't change.
const delay = (ms = 150) => new Promise((r) => setTimeout(r, ms));

// In-memory "database": edits persist until the page reloads.
let store: Candidate[] = MOCK_CANDIDATES.map((c) => ({ ...c }));

export async function getCandidates(): Promise<Candidate[]> {
  await delay();
  return store.map((c) => ({ ...c }));
}

export async function getCandidate(id: string): Promise<Candidate | null> {
  await delay();
  const found = store.find((c) => c.id === id);
  return found ? { ...found } : null;
}

export async function updateCandidateProfile(
  id: string,
  update: PublicProfileUpdate,
): Promise<Candidate> {
  await delay();
  const index = store.findIndex((c) => c.id === id);
  const current = store[index];
  if (!current) throw new Error("Candidate not found");
  const next = { ...current, ...update };
  store = store.map((c, i) => (i === index ? next : c));
  recordActivity("candidates", `Updated the public profile of ${next.name}`);
  return { ...next };
}

// Used by the judging feature's advance/disqualify actions.
export async function applyJudgingDecision(
  ids: string[],
  patch: Partial<
    Pick<
      Candidate,
      | "stage"
      | "phase"
      | "status"
      | "disqualificationReason"
      | "eliminatedAt"
      | "disqualifiedAt"
    >
  >,
): Promise<Candidate[]> {
  await delay();
  const set = new Set(ids);
  store = store.map((c) => (set.has(c.id) ? { ...c, ...patch } : c));
  return store.filter((c) => set.has(c.id)).map((c) => ({ ...c }));
}
