import type { Round, Score } from "../types";

// SCORING POLICY (a real decision, not a UI detail — confirm it):
//  • round score  = AVERAGE of that round's criteria scores (so rounds with
//    different criteria counts stay comparable on the same 1–10 scale)
//  • judge's stage score = AVERAGE of the round scores they've SUBMITTED
//  • candidate's aggregate = AVERAGE of the judges' stage scores
// Drafts never count toward any of these.
const avg = (nums: number[]) =>
  nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;

export function roundScore(
  values: Record<string, number>,
  criteria: string[],
): number | null {
  return avg(
    criteria.map((c) => values[c]).filter((v): v is number => v != null),
  );
}

export const isComplete = (
  values: Record<string, number>,
  criteria: string[],
) => criteria.every((c) => values[c] != null);

export function stageScoreForJudge(scores: Score[], rounds: Round[]) {
  const perRound = rounds
    .map((r) => {
      const s = scores.find(
        (x) => x.roundId === r.id && x.status === "submitted",
      );
      return s ? roundScore(s.values, r.criteria) : null;
    })
    .filter((v): v is number => v != null);
  const score = avg(perRound);
  return score == null ? null : { score, rounds: perRound.length };
}

export const formatScore = (n: number | null | undefined) =>
  n == null ? "—" : n.toFixed(1);

export { avg };
