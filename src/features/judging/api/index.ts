import { recordActivity } from "@/features/activity-log/api";
import { applyJudgingDecision, getCandidates } from "@/features/candidates/api";
import type { Candidate, CandidateStage } from "@/features/candidates/types";
import { JUDGES, MOCK_SCORES } from "../data/mock-scores";
import { STAGES, getStageConfig, nextStageId } from "../data/mock-stages";
import type { Judge, LeaderboardEntry, Score, StageConfig } from "../types";
import { avg, roundScore, stageScoreForJudge } from "../utils/scoring";

// Dummy data layer — same swap-later discipline as the candidates api. These
// functions are judges-only by design; the route guards enforce that in the UI
// (frontend-only, see lib/rbac.ts) and the real backend must enforce it too.
const delay = (ms = 150) => new Promise((r) => setTimeout(r, ms));

// Short label for activity entries: the LGA when they share one, else the names.
const describe = (cs: Candidate[]) =>
  new Set(cs.map((c) => c.lga)).size === 1
    ? cs[0]!.lga
    : cs.length <= 3
      ? cs.map((c) => c.name).join(", ")
      : `${cs.length} LGAs`;

let scores: Score[] = MOCK_SCORES.map((s) => ({
  ...s,
  values: { ...s.values },
}));

export async function getStages(): Promise<StageConfig[]> {
  await delay(0);
  return STAGES;
}

export async function getJudges(): Promise<Judge[]> {
  await delay(0);
  return JUDGES;
}

export async function getJudgingQueue(
  stage: CandidateStage,
): Promise<Candidate[]> {
  const all = await getCandidates();
  return all.filter((c) => c.stage === stage);
}

// A judge's own scores (drafts included) — scoring screen + queue progress.
export async function getMyScores(
  judgeId: string,
  filter: { candidateId?: string; stage?: CandidateStage } = {},
): Promise<Score[]> {
  await delay();
  const roundIds = filter.stage
    ? new Set(getStageConfig(filter.stage).rounds.map((r) => r.id))
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

// At the Grand Finale "advance" crowns the single winner; before that it
// marks the candidate as advanced (the next stage opens via promoteAdvanced).
export async function advanceCandidates(
  ids: string[],
  stage: CandidateStage,
): Promise<Candidate[]> {
  if (stage === "grand_finale" && ids.length !== 1) {
    throw new Error("Only one winner can be crowned.");
  }
  const result = await applyJudgingDecision(ids, {
    status: stage === "grand_finale" ? "winner" : "advanced",
  });
  recordActivity(
    "judging",
    stage === "grand_finale"
      ? `Crowned ${result[0]?.name} as winner`
      : `Advanced ${result.length} candidate${result.length === 1 ? "" : "s"} (${describe(result)}, ${getStageConfig(stage).name})`,
  );
  return result;
}

export async function disqualifyCandidates(
  ids: string[],
  reason: string,
): Promise<Candidate[]> {
  if (!reason.trim()) throw new Error("A disqualification reason is required.");
  const result = await applyJudgingDecision(ids, {
    status: "disqualified",
    disqualificationReason: reason.trim(),
  });
  recordActivity(
    "judging",
    `Disqualified ${result.length} candidate${result.length === 1 ? "" : "s"} (${describe(result)}) — ${reason.trim()}`,
  );
  return result;
}

// Opens the next stage: every candidate advanced out of `stage` moves into it.
export async function promoteAdvanced(stage: CandidateStage): Promise<number> {
  const next = nextStageId(stage);
  if (!next) return 0;
  const advanced = (await getCandidates()).filter(
    (c) => c.stage === stage && c.status === "advanced",
  );
  await applyJudgingDecision(
    advanced.map((c) => c.id),
    { stage: next, status: "active" },
  );
  if (advanced.length) {
    recordActivity(
      "judging",
      `Opened ${getStageConfig(next).name} with ${advanced.length} advanced candidate${advanced.length === 1 ? "" : "s"}`,
    );
  }
  return advanced.length;
}

export async function getLeaderboard(
  stage: CandidateStage,
): Promise<LeaderboardEntry[]> {
  const candidates = await getCandidates();
  const config = getStageConfig(stage);
  const roundIds = new Set(config.rounds.map((r) => r.id));
  const scored = new Set(
    scores
      .filter((s) => s.status === "submitted" && roundIds.has(s.roundId))
      .map((s) => s.candidateId),
  );

  return candidates
    .filter((c) => c.stage === stage || scored.has(c.id))
    .map((candidate) => {
      const perJudge: LeaderboardEntry["perJudge"] = {};
      const perRound: LeaderboardEntry["perRound"] = {};
      for (const r of config.rounds) perRound[r.id] = {};
      for (const j of JUDGES) {
        const mine = scores.filter(
          (s) => s.judgeId === j.id && s.candidateId === candidate.id,
        );
        perJudge[j.id] = stageScoreForJudge(mine, config.rounds);
        for (const r of config.rounds) {
          const s = mine.find(
            (x) => x.roundId === r.id && x.status === "submitted",
          );
          perRound[r.id]![j.id] = s ? roundScore(s.values, r.criteria) : null;
        }
      }
      const average = avg(
        Object.values(perJudge)
          .filter((v): v is { score: number; rounds: number } => v != null)
          .map((v) => v.score),
      );
      return { candidate, perJudge, average, perRound };
    });
}
