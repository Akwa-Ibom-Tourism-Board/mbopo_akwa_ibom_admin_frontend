import type { Candidate } from "@/features/candidates/types";
import type { RoundClosure, StageConfig } from "../types";

// Pure helpers for the round flow, shared by the api layer and the UI.

export const isClosed = (closures: RoundClosure[], roundId: string) =>
  closures.some((c) => c.roundId === roundId);

// Candidates contesting round `index` of a stage: everyone in the stage who
// hasn't been disqualified and — in an elimination stage — hasn't been cut in
// an earlier round.
export function fieldForRound(
  config: StageConfig,
  index: number,
  candidates: Candidate[],
): Candidate[] {
  return candidates.filter((c) => {
    if (c.stage !== config.id || c.status === "disqualified") return false;
    if (config.mode !== "elimination" || !c.eliminatedAt) return true;
    const cutAt = config.rounds.findIndex((r) => r.id === c.eliminatedAt);
    return cutAt >= index;
  });
}

// Elimination stages run strictly in order: the current round is the first one
// not yet closed (-1 once every round is closed). Cumulative stages have no
// single current round.
export function currentRoundIndex(
  config: StageConfig,
  closures: RoundClosure[],
) {
  if (config.mode !== "elimination") return -1;
  return config.rounds.findIndex((r) => !isClosed(closures, r.id));
}

// Can judges score this round right now?
export function roundOpenForScoring(
  config: StageConfig,
  index: number,
  closures: RoundClosure[],
): { open: boolean; reason?: string } {
  const round = config.rounds[index];
  if (!round) return { open: false, reason: "Unknown round." };
  if (isClosed(closures, round.id)) {
    return { open: false, reason: "This round is closed — scores are locked." };
  }
  if (
    config.mode === "elimination" &&
    index !== currentRoundIndex(config, closures)
  ) {
    const prev = config.rounds[index - 1];
    return {
      open: false,
      reason: `Opens after ${prev?.code ?? "the previous round"} is closed and the field is cut.`,
    };
  }
  return { open: true };
}
