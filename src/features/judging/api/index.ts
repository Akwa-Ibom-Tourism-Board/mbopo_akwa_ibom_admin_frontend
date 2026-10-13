import { recordActivity } from "@/features/activity-log/api";
import { applyJudgingDecision, getCandidates } from "@/features/candidates/api";
import type { Candidate, CandidateStage } from "@/features/candidates/types";
import { JUDGES, MOCK_CLOSURES, MOCK_SCORES } from "../data/mock-scores";
import { STAGES, getStageConfig, nextStageId } from "../data/mock-stages";
import type {
  Judge,
  LeaderboardEntry,
  RoundClosure,
  Score,
  StageConfig,
} from "../types";
import {
  currentRoundIndex,
  fieldForRound,
  isClosed,
  roundOpenForScoring,
} from "../utils/rounds";
import { avg, roundScore, stageScoreForJudge } from "../utils/scoring";

// Dummy data layer — same swap-later discipline as the candidates api. These
// functions are judges-only by design; the route guards enforce that in the UI
// (frontend-only, see lib/rbac.ts) and the real backend must enforce it too,
// including the round-order and locking rules below.
const delay = (ms = 150) => new Promise((r) => setTimeout(r, ms));

let scores: Score[] = MOCK_SCORES.map((s) => ({
  ...s,
  values: { ...s.values },
}));
let closures: RoundClosure[] = MOCK_CLOSURES.map((c) => ({
  ...c,
  passedIds: c.passedIds ? [...c.passedIds] : undefined,
}));

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

// Short label for activity entries: the LGA when they share one, else names.
const describe = (cs: Candidate[]) =>
  new Set(cs.map((c) => c.lga)).size === 1
    ? cs[0]!.lga
    : cs.length <= 3
      ? cs.map((c) => c.name).join(", ")
      : `${cs.length} LGAs`;

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

export async function getClosures(
  stage: CandidateStage,
): Promise<RoundClosure[]> {
  await delay(0);
  const ids = new Set(getStageConfig(stage).rounds.map((r) => r.id));
  return closures
    .filter((c) => ids.has(c.roundId))
    .map((c) => ({
      ...c,
      passedIds: c.passedIds ? [...c.passedIds] : undefined,
    }));
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
  const stage = STAGES.find((s) =>
    s.rounds.some((r) => r.id === input.roundId),
  );
  if (!stage) throw new Error("Unknown round.");
  const index = stage.rounds.findIndex((r) => r.id === input.roundId);
  const gate = roundOpenForScoring(stage, index, closures);
  if (!gate.open) throw new Error(gate.reason);
  const candidate = (await getCandidates()).find(
    (c) => c.id === input.candidateId,
  );
  const inField =
    !!candidate && fieldForRound(stage, index, [candidate]).length === 1;
  if (!inField)
    throw new Error("This candidate isn't in the field for that round.");

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

// Marks candidates as selected in a cumulative stage (stages 1 and 2). The
// Grand Finale has no such action — its field is cut round by round via
// closeRound.
export async function advanceCandidates(
  ids: string[],
  stage: CandidateStage,
): Promise<Candidate[]> {
  const config = getStageConfig(stage);
  if (config.mode !== "cumulative") {
    throw new Error(
      "The Grand Finale is decided by closing each round, not by advancing.",
    );
  }
  const result = await applyJudgingDecision(ids, { status: "advanced" });
  recordActivity(
    "judging",
    `Selected ${plural(result.length, "candidate")} (${describe(result)}, ${config.name})`,
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
    `Disqualified ${plural(result.length, "candidate")} (${describe(result)}) — ${reason.trim()}`,
  );
  return result;
}

// Locks a round's scores. In the Grand Finale it also records the cut: only
// `passedIds` go on; the rest of the field is eliminated here. Round 5 leaves
// exactly one — the winner.
export async function closeRound(roundId: string, passedIds?: string[]) {
  const stage = STAGES.find((s) => s.rounds.some((r) => r.id === roundId));
  if (!stage) throw new Error("Unknown round.");
  const index = stage.rounds.findIndex((r) => r.id === roundId);
  const round = stage.rounds[index]!;
  if (isClosed(closures, roundId))
    throw new Error("That round is already closed.");

  if (stage.mode === "cumulative") {
    closures = [...closures, { roundId, closedAt: new Date().toISOString() }];
    recordActivity("judging", `Closed ${round.name} (${stage.name})`);
    return;
  }

  if (index !== currentRoundIndex(stage, closures)) {
    throw new Error(
      `Close ${stage.rounds[currentRoundIndex(stage, closures)]?.code} first.`,
    );
  }
  const field = fieldForRound(stage, index, await getCandidates());
  const passed = passedIds ?? [];
  const last = index === stage.rounds.length - 1;
  if (passed.length === 0) throw new Error("Choose who goes through.");
  if (!passed.every((id) => field.some((c) => c.id === id))) {
    throw new Error("Only candidates in this round can go through.");
  }
  if (last && passed.length !== 1)
    throw new Error("The final round must leave exactly one winner.");
  if (!last && passed.length >= field.length) {
    throw new Error("A cut has to eliminate at least one candidate.");
  }

  const out = field.filter((c) => !passed.includes(c.id));
  if (out.length) {
    await applyJudgingDecision(
      out.map((c) => c.id),
      { status: "eliminated", eliminatedAt: roundId },
    );
  }
  if (last) await applyJudgingDecision(passed, { status: "winner" });
  closures = [
    ...closures,
    { roundId, closedAt: new Date().toISOString(), passedIds: passed },
  ];
  recordActivity(
    "judging",
    last
      ? `Closed ${round.code}: crowned the winner`
      : `Closed ${round.code}: ${plural(passed.length, "candidate")} through, ${plural(out.length, "candidate")} eliminated`,
  );
}

// Cumulative stages only, and only before any cut: unlock a round to correct
// scores.
export async function reopenRound(roundId: string) {
  const stage = STAGES.find((s) => s.rounds.some((r) => r.id === roundId));
  const closure = closures.find((c) => c.roundId === roundId);
  if (!stage || !closure) throw new Error("That round isn't closed.");
  if (stage.mode !== "cumulative") throw new Error("A cut can't be undone.");
  closures = closures.filter((c) => c.roundId !== roundId);
  recordActivity(
    "judging",
    `Reopened ${stage.rounds.find((r) => r.id === roundId)!.name}`,
  );
}

// Finishes a cumulative stage: selected candidates move into the next stage;
// everyone else still competing is eliminated. Needs every round closed.
export async function closeStage(
  stage: CandidateStage,
): Promise<{ promoted: number; eliminated: number }> {
  const config = getStageConfig(stage);
  const next = nextStageId(stage);
  if (config.mode !== "cumulative" || !next) {
    throw new Error("This stage is finished by closing its rounds.");
  }
  if (!config.rounds.every((r) => isClosed(closures, r.id))) {
    throw new Error("Close every round before closing the stage.");
  }
  const inStage = (await getCandidates()).filter((c) => c.stage === stage);
  const advanced = inStage.filter((c) => c.status === "advanced");
  const rest = inStage.filter((c) => c.status === "active");
  await applyJudgingDecision(
    advanced.map((c) => c.id),
    { stage: next, status: "active" },
  );
  await applyJudgingDecision(
    rest.map((c) => c.id),
    { status: "eliminated", eliminatedAt: stage },
  );
  recordActivity(
    "judging",
    `Closed ${config.name}: ${plural(advanced.length, "candidate")} into ${getStageConfig(next).name}, ${rest.length} not selected`,
  );
  return { promoted: advanced.length, eliminated: rest.length };
}

// `roundId` narrows the board to one round (this is what the Grand Finale cut
// is decided on); without it, each judge's score is the average of their
// submitted rounds in the stage.
export async function getLeaderboard(
  stage: CandidateStage,
  roundId?: string,
): Promise<LeaderboardEntry[]> {
  const candidates = await getCandidates();
  const config = getStageConfig(stage);
  const rounds = roundId
    ? config.rounds.filter((r) => r.id === roundId)
    : config.rounds;
  const roundIds = new Set(rounds.map((r) => r.id));
  const scored = new Set(
    scores
      .filter((s) => s.status === "submitted" && roundIds.has(s.roundId))
      .map((s) => s.candidateId),
  );
  const inField = new Set<string>();
  rounds.forEach((r) => {
    fieldForRound(config, config.rounds.indexOf(r), candidates).forEach((c) =>
      inField.add(c.id),
    );
  });

  return candidates
    .filter((c) => inField.has(c.id) || scored.has(c.id))
    .map((candidate) => {
      const perJudge: LeaderboardEntry["perJudge"] = {};
      const perRound: LeaderboardEntry["perRound"] = {};
      for (const r of config.rounds) perRound[r.id] = {};
      for (const j of JUDGES) {
        const mine = scores.filter(
          (s) => s.judgeId === j.id && s.candidateId === candidate.id,
        );
        perJudge[j.id] = stageScoreForJudge(mine, rounds);
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
