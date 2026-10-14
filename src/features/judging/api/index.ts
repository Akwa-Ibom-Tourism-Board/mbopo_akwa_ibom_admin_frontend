import { recordActivity } from "@/features/activity-log/api";
import { readSessionUser } from "@/features/auth/session";
import {
  applyJudgingDecision,
  getCandidates,
  recordCandidateEvents,
} from "@/features/candidates/api";
import type { Candidate } from "@/features/candidates/types";
import {
  getPhaseStates,
  phaseStateSync,
  setPhaseState,
} from "@/features/stages/api";
import { participantsOf, inField } from "@/features/stages/utils/participants";
import { isUserActiveSync, judgeRosterSync } from "@/features/users/api";
import { can, isJudgeRole } from "@/lib/rbac";
import {
  PHASES,
  phaseIndex,
  phaseTitle,
  stageOfPhase,
  type PhaseId,
} from "@/lib/phases";
import { JUDGES, MOCK_SCORES } from "../data/mock-scores";
import {
  PHASE_QUOTA,
  STAGES,
  phaseOfRound,
  roundsOf,
} from "../data/mock-stages";
import type {
  FinalizeStatus,
  Judge,
  LeaderboardEntry,
  Score,
  StageConfig,
} from "../types";
import { avg, roundScore, stageScoreForJudge } from "../utils/scoring";

// Dummy data layer — same swap-later discipline as the other features. The
// rules enforced here are the ones the real backend must enforce on its own:
//  • only judges score or disqualify, and only while the stage is OPEN;
//  • a judge can only ever read or change their OWN scores — never another
//    judge's, including the Head Judge's;
//  • a closed stage is locked for everyone.
const delay = (ms = 150) => new Promise((r) => setTimeout(r, ms));

let scores: Score[] = MOCK_SCORES.map((s) => ({
  ...s,
  values: { ...s.values },
}));

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

// Short label for activity entries: the LGA when they share one, else names.
const describe = (cs: Candidate[]) =>
  new Set(cs.map((c) => c.lga)).size === 1
    ? cs[0]!.lga
    : cs.length <= 3
      ? cs.map((c) => c.name).join(", ")
      : `${cs.length} LGAs`;

// A deactivated account can't act, even if its session is still open.
function assertActive(actor: { id: string }) {
  if (!isUserActiveSync(actor.id)) {
    throw new Error("This account has been deactivated.");
  }
}

function requireJudge() {
  const actor = readSessionUser();
  if (!actor || !isJudgeRole(actor.role)) {
    throw new Error("Only judges can do that.");
  }
  assertActive(actor);
  return actor;
}

// WHOSE SCORES COUNT in a stage:
//  • a stage that isn't closed yet counts every judge whose account is ACTIVE
//    right now — deactivating a judge removes their scores from it, and
//    reactivating brings them back (their scores are kept, just not counted);
//  • a closed stage counts exactly the judges it was closed with. Deactivating
//    someone afterwards changes nothing about it.
function countedJudges(phase: PhaseId): Judge[] {
  const roster = judgeRosterSync();
  const byId = new Map(roster.map((r) => [r.id, r]));
  const state = phaseStateSync(phase);
  if (state.status === "closed") {
    const ids = state.countedJudgeIds ?? JUDGES.map((j) => j.id);
    return ids.map((id) => {
      const r = byId.get(id);
      return {
        id,
        name: r?.name ?? JUDGES.find((j) => j.id === id)?.name ?? id,
        head: r?.head ?? JUDGES.find((j) => j.id === id)?.head,
        active: r?.active ?? false,
      };
    });
  }
  return roster
    .filter((r) => r.active)
    .map((r) => ({ id: r.id, name: r.name, head: r.head, active: true }));
}

function requireOpen(phase: PhaseId) {
  const state = phaseStateSync(phase);
  if (state.status === "closed") {
    throw new Error(`${phaseTitle(phase)} is closed — its scores are locked.`);
  }
  if (state.status === "pending") {
    throw new Error(`${phaseTitle(phase)} hasn't been opened yet.`);
  }
  if (state.resultsSubmittedAt) {
    throw new Error(
      `Results for ${phaseTitle(phase)} have been submitted — its scores are locked.`,
    );
  }
}

export async function getStages(): Promise<StageConfig[]> {
  await delay(0);
  return STAGES;
}

// The judges whose scores count in `phase` (see countedJudges).
export async function getJudges(phase: PhaseId): Promise<Judge[]> {
  await delay(0);
  return countedJudges(phase);
}

// A judge's own scores (drafts included). Reading someone else's is refused.
export async function getMyScores(
  judgeId: string,
  filter: { candidateId?: string; phase?: PhaseId } = {},
): Promise<Score[]> {
  await delay();
  if (requireJudge().id !== judgeId) {
    throw new Error("You can only view your own scores.");
  }
  const roundIds = filter.phase
    ? new Set(roundsOf(filter.phase).map((r) => r.id))
    : null;
  return scores
    .filter(
      (s) =>
        s.judgeId === judgeId &&
        (!filter.candidateId || s.candidateId === filter.candidateId) &&
        (!roundIds || roundIds.has(s.roundId)),
    )
    .map((s) => ({ ...s, values: { ...s.values } }));
}

export async function saveScore(
  input: Omit<Score, "updatedAt">,
): Promise<Score> {
  await delay();
  const actor = requireJudge();
  if (actor.id !== input.judgeId) {
    throw new Error("You can only change your own scores.");
  }
  const phase = phaseOfRound(input.roundId);
  if (!phase) throw new Error("Unknown round.");
  requireOpen(phase);
  const candidate = (await getCandidates()).find(
    (c) => c.id === input.candidateId,
  );
  if (!candidate || !inField(candidate, phase)) {
    throw new Error("This candidate isn't competing in that stage.");
  }

  const next: Score = { ...input, updatedAt: new Date().toISOString() };
  scores = [
    ...scores.filter(
      (s) =>
        !(
          s.judgeId === input.judgeId &&
          s.candidateId === input.candidateId &&
          s.roundId === input.roundId
        ),
    ),
    next,
  ];
  return next;
}

// Rule-breakers only — a normal cut is the Head Judge's finalize step.
export async function disqualifyCandidates(
  ids: string[],
  reason: string,
): Promise<Candidate[]> {
  await delay();
  requireJudge();
  if (!reason.trim()) throw new Error("A disqualification reason is required.");
  const targets = (await getCandidates()).filter((c) => ids.includes(c.id));
  if (targets.length !== ids.length) throw new Error("Candidate not found.");
  for (const c of targets) {
    requireOpen(c.phase);
    if (c.status !== "active") {
      throw new Error(
        `${c.name} isn't competing, so can't be disqualified now.`,
      );
    }
  }
  const result: Candidate[] = [];
  for (const phase of new Set(targets.map((c) => c.phase))) {
    const batch = targets.filter((c) => c.phase === phase).map((c) => c.id);
    result.push(
      ...(await applyJudgingDecision(batch, {
        status: "disqualified",
        disqualificationReason: reason.trim(),
        disqualifiedAt: phase,
      })),
    );
  }
  for (const c of result) {
    recordCandidateEvents(
      [c.id],
      "judging",
      `Disqualified at ${phaseTitle(c.disqualifiedAt!)} — ${reason.trim()}`,
    );
  }
  recordActivity(
    "judging",
    `Disqualified ${plural(result.length, "candidate")} (${describe(result)}, ${phaseTitle(result[0]!.disqualifiedAt!)}) — ${reason.trim()}`,
  );
  return result;
}

// Every judge's score per candidate for a stage, added up. Judges-only data;
// a stage that hasn't opened has nothing to show.
export async function getLeaderboard(
  phase: PhaseId,
): Promise<LeaderboardEntry[]> {
  await delay();
  requireJudge();
  return buildStandings(phase);
}

// The ranked standings the Head Judge — or the Super Admin, who may also submit
// results — chooses from. This is the only place the Super Admin sees scores
// (ranks and totals, inside the submit-results dialog); they can't enter or
// change any.
export async function getResultsStandings(
  phase: PhaseId,
): Promise<LeaderboardEntry[]> {
  await delay();
  if (!can(readSessionUser()?.role, "results.submit")) {
    throw new Error(
      "Only the Head Judge can see the standings to submit results.",
    );
  }
  return buildStandings(phase);
}

async function buildStandings(phase: PhaseId): Promise<LeaderboardEntry[]> {
  if (phaseStateSync(phase).status === "pending") return [];
  const rounds = roundsOf(phase);
  const judges = countedJudges(phase);
  const candidates = await getCandidates();

  return participantsOf(phase, candidates)
    .filter((p) => p.outcome !== "incoming")
    .map(({ candidate }) => {
      const perJudge: LeaderboardEntry["perJudge"] = {};
      const perRound: LeaderboardEntry["perRound"] = {};
      for (const r of rounds) perRound[r.id] = {};
      for (const j of judges) {
        const mine = scores.filter(
          (s) => s.judgeId === j.id && s.candidateId === candidate.id,
        );
        perJudge[j.id] = stageScoreForJudge(mine, rounds);
        for (const r of rounds) {
          const s = mine.find(
            (x) => x.roundId === r.id && x.status === "submitted",
          );
          perRound[r.id]![j.id] = s ? roundScore(s.values, r.criteria) : null;
        }
      }
      const judgeScores = Object.values(perJudge)
        .filter((v): v is { score: number; rounds: number } => v != null)
        .map((v) => v.score);
      return {
        candidate,
        perJudge,
        perRound,
        total: judgeScores.length
          ? judgeScores.reduce((a, b) => a + b, 0)
          : null,
        average: avg(judgeScores),
      };
    });
}

function finalizeStatusFor(phase: PhaseId, field: Candidate[]): FinalizeStatus {
  const rounds = roundsOf(phase);
  const judges = countedJudges(phase).map((j) => ({
    id: j.id,
    name: j.name,
    head: j.head,
    outstanding: field.filter((c) =>
      rounds.some(
        (r) =>
          !scores.some(
            (s) =>
              s.judgeId === j.id &&
              s.candidateId === c.id &&
              s.roundId === r.id &&
              s.status === "submitted",
          ),
      ),
    ).length,
  }));
  const state = phaseStateSync(phase);
  return {
    phaseId: phase,
    stageStatus: state.status,
    fieldCount: field.length,
    judges,
    ready:
      state.status === "open" &&
      field.length > 0 &&
      judges.length > 0 &&
      judges.every((j) => j.outstanding === 0),
  };
}

// How far each judge is through the stage's candidates — what stands between
// the Head Judge and finalizing.
export async function getFinalizeStatus(
  phase: PhaseId,
): Promise<FinalizeStatus> {
  await delay();
  requireJudge();
  const field = (await getCandidates()).filter((c) => inField(c, phase));
  return finalizeStatusFor(phase, field);
}

// SUBMIT RESULTS — choose who goes through. The Head Judge can do it once every
// judge has finished scoring; the Super Admin can do it at any time, with no
// prerequisites. Everyone else still competing is eliminated; the Grand
// Finale's last round leaves one winner. Submitting locks every judge's scores
// but leaves the stage open until it is closed (see closeStage).
export async function submitResults(phase: PhaseId, passedIds: string[]) {
  await delay();
  const actor = readSessionUser();
  if (!can(actor?.role, "results.submit")) {
    throw new Error("Only the Head Judge can submit results.");
  }
  assertActive(actor!);
  requireOpen(phase);
  const field = (await getCandidates()).filter((c) => inField(c, phase));
  if (!can(actor?.role, "results.submitAnytime")) {
    const status = finalizeStatusFor(phase, field);
    if (!status.ready) {
      const waiting = status.judges
        .filter((j) => j.outstanding > 0)
        .map((j) => j.name);
      throw new Error(
        `Every judge must finish scoring first. Waiting on: ${waiting.join(", ")}.`,
      );
    }
  }

  const passed = new Set(passedIds);
  if (passed.size === 0) throw new Error("Choose who goes through.");
  if (![...passed].every((id) => field.some((c) => c.id === id))) {
    throw new Error("Only candidates competing in this stage can go through.");
  }
  const quota = PHASE_QUOTA[phase];
  if (quota) {
    const lgas = new Set(field.map((c) => c.lga));
    for (const lga of lgas) {
      const n = field.filter((c) => passed.has(c.id) && c.lga === lga).length;
      if (n > quota)
        throw new Error(
          `${lga} can send at most ${quota} through (${n} chosen).`,
        );
    }
  }
  const finalRound = phase === "gf-r5";
  if (finalRound && passed.size !== 1) {
    throw new Error("The last round must leave exactly one winner.");
  }
  if (phase.startsWith("gf-") && !finalRound && passed.size >= field.length) {
    throw new Error("A round has to eliminate at least one candidate.");
  }

  const out = field.filter((c) => !passed.has(c.id));
  if (out.length) {
    await applyJudgingDecision(
      out.map((c) => c.id),
      { status: "eliminated", eliminatedAt: phase },
    );
  }
  await applyJudgingDecision([...passed], {
    status: finalRound ? "winner" : "advanced",
  });

  recordCandidateEvents(
    [...passed],
    "judging",
    finalRound
      ? "Crowned winner of Mbopo Akwa Ibom"
      : `Finalized through ${phaseTitle(phase)}`,
  );
  if (out.length) {
    recordCandidateEvents(
      out.map((c) => c.id),
      "judging",
      `Eliminated in ${phaseTitle(phase)}`,
    );
  }

  setPhaseState({
    ...phaseStateSync(phase),
    resultsSubmittedAt: new Date().toISOString(),
    resultsSubmittedBy: actor
      ? `${actor.firstName} ${actor.lastName}`
      : undefined,
    resultsSubmittedByRole: actor?.role,
    passedIds: [...passed],
  });
  recordActivity(
    "judging",
    finalRound
      ? `Submitted the results of ${phaseTitle(phase)}: winner chosen`
      : `Submitted the results of ${phaseTitle(phase)}: ${plural(passed.size, "candidate")} through, ${out.length} eliminated`,
  );
  return { through: passed.size, eliminated: out.length };
}

// CLOSE a stage. The Head Judge and an Admin can only close once results have
// been submitted; the Super Admin can close whenever (see submitResultsAndClose
// for submitting and closing in one go). Closing changes no candidate — it
// ends the stage so the next one can be opened.
export async function closeStage(phase: PhaseId) {
  await delay();
  const actor = readSessionUser();
  if (!can(actor?.role, "stages.close")) {
    throw new Error("You can't close a stage.");
  }
  assertActive(actor!);
  const state = phaseStateSync(phase);
  if (state.status !== "open") {
    throw new Error(`${phaseTitle(phase)} isn't open, so it can't be closed.`);
  }
  if (!state.resultsSubmittedAt) {
    throw new Error(
      can(actor?.role, "results.submitAnytime")
        ? "Submit the results first."
        : "The Head Judge hasn't submitted the results yet.",
    );
  }
  setPhaseState({
    ...state,
    status: "closed",
    closedAt: new Date().toISOString(),
    closedBy: actor ? `${actor.firstName} ${actor.lastName}` : undefined,
    closedByRole: actor?.role,
    // Freeze whose scores counted: later deactivations must not touch this.
    countedJudgeIds: countedJudges(phase).map((j) => j.id),
  });
  recordActivity("judging", `Closed ${phaseTitle(phase)}`);
}

// Super Admin: submit the results and close the stage in one step.
export async function submitResultsAndClose(
  phase: PhaseId,
  passedIds: string[],
) {
  if (!can(readSessionUser()?.role, "results.submitAnytime")) {
    throw new Error(
      "Results can only be submitted and closed together by a Super Admin.",
    );
  }
  const outcome = await submitResults(phase, passedIds);
  await closeStage(phase);
  return outcome;
}

// Reopens a closed stage so scores can be corrected and it can be finalized
// again. Admin / Super Admin only, with one difference:
//  • an Admin may reopen only the MOST RECENTLY CLOSED stage — once the event
//    has moved past a stage (a later one is closed) it can't be reopened;
//  • a Super Admin may reopen any closed stage.
// Reopening undoes that stage's finalization (candidates who went through or
// were cut return to it; disqualifications made inside it stand) and WIPES
// every stage after it — scores, movements, disqualifications — back to
// "never opened". The reopened stage keeps its own scores.
export async function reopenStage(
  phase: PhaseId,
): Promise<{ wiped: PhaseId[] }> {
  await delay();
  const actor = readSessionUser();
  if (!can(actor?.role, "stages.open")) {
    throw new Error("Only an administrator can reopen a stage.");
  }
  const states = await getPhaseStates();
  const state = states.find((s) => s.phaseId === phase);
  if (!state || state.status !== "closed") {
    throw new Error("Only a closed stage can be reopened.");
  }
  const idx = phaseIndex(phase);
  const laterClosed = states.some(
    (s) => phaseIndex(s.phaseId) > idx && s.status === "closed",
  );
  if (laterClosed && !can(actor?.role, "stages.reopenAny")) {
    throw new Error("This stage can't be reopened — the event has moved on.");
  }

  // Later stages that have actually been opened lose everything; ones still
  // pending have nothing to lose.
  const later = PHASES.slice(idx + 1).map((p) => p.id);
  const wiped = later.filter(
    (id) => states.find((s) => s.phaseId === id)?.status !== "pending",
  );
  const wipedRounds = new Set(
    wiped.flatMap((id) => roundsOf(id).map((r) => r.id)),
  );
  scores = scores.filter((s) => !wipedRounds.has(s.roundId));

  // Everyone who had reached this stage or beyond returns to it, still
  // competing — except people disqualified inside this very stage.
  const affected = (await getCandidates()).filter(
    (c) =>
      phaseIndex(c.phase) >= idx &&
      !(c.status === "disqualified" && c.disqualifiedAt === phase),
  );
  await applyJudgingDecision(
    affected.map((c) => c.id),
    {
      phase,
      stage: stageOfPhase(phase),
      status: "active",
      eliminatedAt: undefined,
      disqualifiedAt: undefined,
      disqualificationReason: undefined,
    },
  );

  if (affected.length) {
    recordCandidateEvents(
      affected.map((c) => c.id),
      "judging",
      `Returned to ${phaseTitle(phase)} — the stage was reopened`,
    );
  }
  for (const id of later) setPhaseState({ phaseId: id, status: "pending" });
  setPhaseState({
    phaseId: phase,
    status: "open",
    openedAt: state.openedAt,
    openedBy: state.openedBy,
    openedByRole: state.openedByRole,
    reopenedAt: new Date().toISOString(),
    reopenedBy: actor ? `${actor.firstName} ${actor.lastName}` : undefined,
    reopenedByRole: actor?.role,
  });
  recordActivity(
    "judging",
    wiped.length
      ? `Reopened ${phaseTitle(phase)} and cleared ${wiped.map(phaseTitle).join(", ")}`
      : `Reopened ${phaseTitle(phase)}`,
  );
  return { wiped };
}
