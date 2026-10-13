import { recordActivity } from "@/features/activity-log/api";
import { readSessionUser } from "@/features/auth/session";
import { applyJudgingDecision, getCandidates } from "@/features/candidates/api";
import type { Candidate } from "@/features/candidates/types";
import { phaseStateSync } from "@/features/stages/api";
import { participantsOf, inField } from "@/features/stages/utils/participants";
import { isJudgeRole } from "@/lib/rbac";
import { phaseTitle, type PhaseId } from "@/lib/phases";
import { JUDGES, MOCK_SCORES } from "../data/mock-scores";
import { STAGES, phaseOfRound, roundsOf } from "../data/mock-stages";
import type { Judge, LeaderboardEntry, Score, StageConfig } from "../types";
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
