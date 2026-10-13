import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { candidateKeys } from "@/features/candidates/api/hooks";
import type { CandidateStage } from "@/features/candidates/types";
import {
  advanceCandidates,
  closeRound,
  closeStage,
  disqualifyCandidates,
  getClosures,
  getJudges,
  getJudgingQueue,
  getLeaderboard,
  getMyScores,
  reopenRound,
  saveScore,
} from ".";

export const judgingKeys = {
  queue: (stage: CandidateStage) => ["judging", "queue", stage] as const,
  closures: (stage: CandidateStage) => ["judging", "closures", stage] as const,
  myScores: (judgeId: string, key: string) =>
    ["judging", "scores", judgeId, key] as const,
  leaderboard: (stage: CandidateStage, roundId?: string) =>
    ["judging", "leaderboard", stage, roundId ?? "all"] as const,
  judges: ["judging", "judges"] as const,
};

export const useJudgingQueue = (stage: CandidateStage) =>
  useQuery({
    queryKey: judgingKeys.queue(stage),
    queryFn: () => getJudgingQueue(stage),
  });

export const useClosures = (stage: CandidateStage) =>
  useQuery({
    queryKey: judgingKeys.closures(stage),
    queryFn: () => getClosures(stage),
  });

export const useMyStageScores = (judgeId: string, stage: CandidateStage) =>
  useQuery({
    queryKey: judgingKeys.myScores(judgeId, `stage:${stage}`),
    queryFn: () => getMyScores(judgeId, { stage }),
  });

export const useMyCandidateScores = (judgeId: string, candidateId: string) =>
  useQuery({
    queryKey: judgingKeys.myScores(judgeId, `cand:${candidateId}`),
    queryFn: () => getMyScores(judgeId, { candidateId }),
  });

export const useLeaderboard = (stage: CandidateStage, roundId?: string) =>
  useQuery({
    queryKey: judgingKeys.leaderboard(stage, roundId),
    queryFn: () => getLeaderboard(stage, roundId),
  });

export const useJudges = () =>
  useQuery({ queryKey: judgingKeys.judges, queryFn: getJudges });

function useInvalidateAll() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["judging"] }),
      qc.invalidateQueries({ queryKey: candidateKeys.all }),
      qc.invalidateQueries({ queryKey: ["activity"] }),
    ]);
}

export function useSaveScore() {
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: saveScore, onSuccess: invalidate });
}

export function useAdvance(stage: CandidateStage) {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (ids: string[]) => advanceCandidates(ids, stage),
    onSuccess: invalidate,
  });
}

export function useDisqualify() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: ({ ids, reason }: { ids: string[]; reason: string }) =>
      disqualifyCandidates(ids, reason),
    onSuccess: invalidate,
  });
}

export function useCloseRound() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: ({
      roundId,
      passedIds,
    }: {
      roundId: string;
      passedIds?: string[];
    }) => closeRound(roundId, passedIds),
    onSuccess: invalidate,
  });
}

export function useReopenRound() {
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: reopenRound, onSuccess: invalidate });
}

export function useCloseStage() {
  const invalidate = useInvalidateAll();
  return useMutation({ mutationFn: closeStage, onSuccess: invalidate });
}
