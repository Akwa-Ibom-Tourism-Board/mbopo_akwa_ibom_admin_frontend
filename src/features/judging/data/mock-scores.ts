import { MOCK_CANDIDATES } from "@/features/candidates/data/mock-candidates";
import { STAGES } from "./mock-stages";
import type { Judge, Score } from "../types";

// Dummy judges. The first matches the dummy login account (auth feature);
// the other three exist only as users/score authors.
export const JUDGES: Judge[] = [
  { id: "u-judge-1", name: "Idara Okon" },
  { id: "u-judge-2", name: "Ekaette Umoh" },
  { id: "u-judge-3", name: "Barr. Etido Ita" },
  { id: "u-judge-4", name: "Dr. Affiong Effiong" },
];

// Deterministic pseudo-random 5–9 so the leaderboard has a believable spread.
const pick = (seed: number) => 5 + (((seed * 2654435761) >>> 0) % 5);

function seedScores(): Score[] {
  const out: Score[] = [];
  const seeded = MOCK_CANDIDATES.filter((c) => c.status !== "disqualified");
  seeded.forEach((c, ci) => {
    const stage = STAGES.find((s) => s.id === c.stage);
    if (!stage) return;
    // Stage 1: first 24 candidates are scored. Senatorial/finale: all of them.
    if (c.stage === "lga_selection" && ci >= 24) return;
    JUDGES.forEach((j, ji) => {
      stage.rounds.forEach((r, ri) => {
        // Leave gaps so progress/drafts have something to show: judge 1 hasn't
        // reached the last round for some candidates, and has a few drafts.
        const isMe = ji === 0;
        if (isMe && ri === stage.rounds.length - 1 && ci % 3 === 0) return;
        const values: Record<string, number> = {};
        r.criteria.forEach((crit, k) => {
          values[crit] = pick(ci * 131 + ji * 17 + ri * 7 + k);
        });
        const draft = isMe && ri === stage.rounds.length - 1 && ci % 3 === 1;
        out.push({
          judgeId: j.id,
          candidateId: c.id,
          roundId: r.id,
          values: draft
            ? Object.fromEntries(Object.entries(values).slice(0, 1))
            : values,
          status: draft ? "draft" : "submitted",
          updatedAt: "2026-09-20T12:00:00.000Z",
        });
      });
    });
  });
  return out;
}

export const MOCK_SCORES: Score[] = seedScores();
