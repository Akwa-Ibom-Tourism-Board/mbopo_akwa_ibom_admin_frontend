import { MOCK_CANDIDATES } from "@/features/candidates/data/mock-candidates";
import type { Candidate } from "@/features/candidates/types";
import { STAGES } from "./mock-stages";
import type { Judge, RoundClosure, Score } from "../types";

// Dummy judges. The first matches the dummy login account (auth feature) and
// all four match the users feature's judge accounts.
export const JUDGES: Judge[] = [
  { id: "u-judge-1", name: "Idara Okon" },
  { id: "u-judge-2", name: "Ekaette Umoh" },
  { id: "u-judge-3", name: "Barr. Etido Ita" },
  { id: "u-judge-4", name: "Dr. Affiong Effiong" },
  { id: "u-hj-1", name: "Prof. Mbuk Inyang", head: true },
];

// Deterministic pseudo-random 5–9 so the leaderboard has a believable spread.
const pick = (seed: number) => 5 + (((seed * 2654435761) >>> 0) % 5);

const finale = STAGES.find((s) => s.id === "grand_finale")!;
const finalists = MOCK_CANDIDATES.filter((c) => c.stage === "grand_finale");
const stillIn = finalists.filter((c) => c.status !== "eliminated");

// Was this candidate still in the field for round index `ri` of their stage?
function inField(c: Candidate, ri: number) {
  if (c.status === "disqualified") return false;
  if (c.stage !== "grand_finale" || !c.eliminatedAt) return true;
  const cutRound = finale.rounds.findIndex((r) => r.id === c.eliminatedAt);
  return cutRound >= ri;
}

function seedScores(): Score[] {
  const out: Score[] = [];
  const scored = MOCK_CANDIDATES.filter((c) => {
    if (c.status === "disqualified") return false;
    if (c.stage === "lga_selection") return false; // handled below
    return true;
  });
  // Stage 1: score the first 24 LGA-stage candidates.
  const stage1 = MOCK_CANDIDATES.filter(
    (c) => c.stage === "lga_selection" && c.status !== "disqualified",
  ).slice(0, 24);

  [...stage1, ...scored].forEach((c, ci) => {
    const stage = STAGES.find((s) => s.id === c.stage);
    if (!stage) return;
    // Finalists are scored in Round 1 and (if they survived the cut) Round 2;
    // Round 3 onwards hasn't happened yet.
    const lastSeeded =
      stage.id === "grand_finale" ? 1 : stage.rounds.length - 1;
    JUDGES.forEach((j, ji) => {
      stage.rounds.forEach((r, ri) => {
        if (ri > lastSeeded || !inField(c, ri)) return;
        // Leave gaps on the open round so progress/drafts have something to
        // show for the signed-in judge.
        const isMe = ji === 0;
        if (isMe && ri === lastSeeded && ci % 3 === 0) return;
        const cutEarly = c.eliminatedAt === "s3-r1" && ri === 0;
        const values: Record<string, number> = {};
        r.criteria.forEach((crit, k) => {
          const v = pick(ci * 131 + ji * 17 + ri * 7 + k);
          values[crit] = cutEarly ? Math.max(1, v - 4) : v;
        });
        const draft = isMe && ri === lastSeeded && ci % 3 === 1;
        out.push({
          judgeId: j.id,
          candidateId: c.id,
          roundId: r.id,
          values: draft
            ? Object.fromEntries(Object.entries(values).slice(0, 1))
            : values,
          status: draft ? "draft" : "submitted",
          question:
            r.questionBank?.questions[
              (ci + ri) % r.questionBank.questions.length
            ],
          cause: r.causes?.[ci % r.causes.length],
          updatedAt: "2026-09-20T12:00:00.000Z",
        });
      });
    });
  });
  return out;
}

export const MOCK_SCORES: Score[] = seedScores();

// Grand Finale Round 1 is already closed: its cut let the surviving finalists
// through and eliminated the other two.
export const MOCK_CLOSURES: RoundClosure[] = [
  {
    roundId: "s3-r1",
    closedAt: "2026-09-21T16:00:00.000Z",
    passedIds: stillIn.map((c) => c.id),
  },
];
