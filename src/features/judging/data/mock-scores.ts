import { MOCK_CANDIDATES } from "@/features/candidates/data/mock-candidates";
import { roundsOf } from "./mock-stages";
import type { Judge, Score } from "../types";

// Dummy judges: four judges plus the Head Judge, who also scores. Ids match
// the users feature and the dummy login accounts.
export const JUDGES: Judge[] = [
  { id: "u-judge-1", name: "Idara Okon" },
  { id: "u-judge-2", name: "Ekaette Umoh" },
  { id: "u-judge-3", name: "Barr. Etido Ita" },
  { id: "u-judge-4", name: "Dr. Affiong Effiong" },
  { id: "u-hj-1", name: "Prof. Mbuk Inyang", head: true },
];

// Deterministic pseudo-random 5–9 so the leaderboard has a believable spread.
const pick = (seed: number) => 5 + (((seed * 2654435761) >>> 0) % 5);

const lgaRounds = roundsOf("lga");
const senatorialRounds = roundsOf("senatorial");

// Everyone who sat the Local Government stage (selected or not) was scored by
// all five judges before it was closed. The 93 selected candidates also have
// Senatorial scores waiting, entered by the judges for that stage — all five
// judges except a few gaps and drafts for the first judge, so the Head Judge
// can see what still holds up finalizing once the stage is open.
function seedScores(): Score[] {
  const out: Score[] = [];
  const sat = MOCK_CANDIDATES.filter((c) => c.status !== "disqualified");
  const selected = MOCK_CANDIDATES.filter((c) => c.status === "advanced");

  const push = (
    judgeIndex: number,
    candidateId: string,
    round: (typeof lgaRounds)[number],
    seed: number,
    shift = 0,
    status: Score["status"] = "submitted",
  ) => {
    const values: Record<string, number> = {};
    round.criteria.forEach((crit, k) => {
      values[crit] = Math.max(1, pick(seed + k) - shift);
    });
    out.push({
      judgeId: JUDGES[judgeIndex]!.id,
      candidateId,
      roundId: round.id,
      values:
        status === "draft"
          ? Object.fromEntries(Object.entries(values).slice(0, 1))
          : values,
      status,
      question:
        round.questionBank?.questions[
          seed % round.questionBank.questions.length
        ],
      updatedAt: "2026-09-10T12:00:00.000Z",
    });
  };

  sat.forEach((c, ci) => {
    JUDGES.forEach((_, ji) =>
      lgaRounds.forEach((r, ri) =>
        push(
          ji,
          c.id,
          r,
          ci * 131 + ji * 17 + ri * 7,
          c.status === "eliminated" ? 3 : 0,
        ),
      ),
    );
  });

  selected.forEach((c, ci) => {
    JUDGES.forEach((_, ji) =>
      senatorialRounds.forEach((r, ri) => {
        const seed = ci * 211 + ji * 19 + ri * 11;
        if (ji === 0 && ci % 19 === 0) return; // not scored yet
        if (ji === 0 && ci % 19 === 1 && ri === 1)
          return push(ji, c.id, r, seed, 0, "draft");
        push(ji, c.id, r, seed);
      }),
    );
  });
  return out;
}

export const MOCK_SCORES: Score[] = seedScores();
