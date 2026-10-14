import { recordActivity } from "@/features/activity-log/api";
import { readSessionUser } from "@/features/auth/session";
import { applyJudgingDecision, getCandidates } from "@/features/candidates/api";
import type { Candidate } from "@/features/candidates/types";
import {
  getPhaseStates,
  phaseStateSync,
  setPhaseState,
} from "@/features/stages/api";
import { participantsOf, inField } from "@/features/stages/utils/participants";
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

function requireJudge() {
  const actor = readSessionUser();
  if (!actor || !isJudgeRole(actor.role)) {
    throw new Error("Only judges can do that.");
  }
  return actor;
}

function requireOpen(phase: PhaseId) {
  const state = phaseStateSync(phase);
  if (state.status === "closed") {
    throw new Error(`${phaseTitle(phase)} is closed — its scores are locked.`);
  }
  if (state.status === "pending") {
    throw new Error(`${phaseTitle(phase)} hasn't been opened yet.`);
  }
}

export async function getStages(): Promise<StageConfig[]> {
  await delay(0);
  return STAGES;
}

export async function getJudges(): Promise<Judge[]> {
  await delay(0);
  return JUDGES;
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
  if (phaseStateSync(phase).status === "pending") return [];
  const rounds = roundsOf(phase);
  const candidates = await getCandidates();

  return participantsOf(phase, candidates)
    .filter((p) => p.outcome !== "incoming")
    .map(({ candidate }) => {
      const perJudge: LeaderboardEntry["perJudge"] = {};
      const perRound: LeaderboardEntry["perRound"] = {};
      for (const r of rounds) perRound[r.id] = {};
      for (const j of JUDGES) {
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
  const judges = JUDGES.map((j) => ({
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

// The Head Judge's step: with every judge's scores in, choose who goes through
// and close the stage. Everyone else still competing is eliminated; the Grand
// Finale's last round leaves one winner. Closing locks the stage for every
// judge — only an Admin / Super Admin can then open the next one.
export async function finalizePhase(phase: PhaseId, passedIds: string[]) {
  await delay();
  const actor = readSessionUser();
  if (!can(actor?.role, "judging.finalize")) {
    throw new Error("Only the Head Judge can finalize a stage.");
  }
  requireOpen(phase);
  const field = (await getCandidates()).filter((c) => inField(c, phase));
  const status = finalizeStatusFor(phase, field);
  if (!status.ready) {
    const waiting = status.judges
      .filter((j) => j.outstanding > 0)
      .map((j) => j.name);
    throw new Error(
      `Every judge must finish scoring first. Waiting on: ${waiting.join(", ")}.`,
    );
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

  const state = phaseStateSync(phase);
  setPhaseState({
    ...state,
    status: "closed",
    closedAt: new Date().toISOString(),
    closedBy: actor ? `${actor.firstName} ${actor.lastName}` : undefined,
    passedIds: [...passed],
  });
  recordActivity(
    "judging",
    finalRound
      ? `Finalized ${phaseTitle(phase)} and crowned the winner`
      : `Finalized and closed ${phaseTitle(phase)}: ${plural(passed.size, "candidate")} through, ${out.length} eliminated`,
  );
  return { through: passed.size, eliminated: out.length };
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
