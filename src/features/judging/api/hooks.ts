import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { candidateKeys } from "@/features/candidates/api/hooks";
import type { CandidateStage } from "@/features/candidates/types";
import {
  advanceCandidates,
  disqualifyCandidates,
  getJudges,
  getJudgingQueue,
  getLeaderboard,
  getMyScores,
  promoteAdvanced,
  saveScore,
} from ".";

export const judgingKeys = {
  queue: (stage: CandidateStage) => ["judging", "queue", stage] as const,
  myScores: (judgeId: string, key: string) =>
    ["judging", "scores", judgeId, key] as const,
  leaderboard: (stage: CandidateStage) =>
    ["judging", "leaderboard", stage] as const,
  judges: ["judging", "judges"] as const,
};

export const useJudgingQueue = (stage: CandidateStage) =>
  useQuery({
    queryKey: judgingKeys.queue(stage),
    queryFn: () => getJudgingQueue(stage),
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

export const useLeaderboard = (stage: CandidateStage) =>
  useQuery({
    queryKey: judgingKeys.leaderboard(stage),
    queryFn: () => getLeaderboard(stage),
  });

export const useJudges = () =>
  useQuery({ queryKey: judgingKeys.judges, queryFn: getJudges });

function useInvalidateAll() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["judging"] }),
      qc.invalidateQueries({ queryKey: candidateKeys.all }),
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

export function usePromoteAdvanced(stage: CandidateStage) {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: () => promoteAdvanced(stage),
    onSuccess: invalidate,
  });
}
