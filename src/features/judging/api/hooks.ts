import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { candidateKeys } from "@/features/candidates/api/hooks";
import type { PhaseId } from "@/lib/phases";
import {
  disqualifyCandidates,
  finalizePhase,
  getFinalizeStatus,
  getJudges,
  getLeaderboard,
  getMyScores,
  saveScore,
} from ".";

export const judgingKeys = {
  myScores: (judgeId: string, key: string) =>
    ["judging", "scores", judgeId, key] as const,
  leaderboard: (phase: PhaseId) => ["judging", "leaderboard", phase] as const,
  judges: ["judging", "judges"] as const,
};

export const useMyPhaseScores = (judgeId: string, phase: PhaseId) =>
  useQuery({
    queryKey: judgingKeys.myScores(judgeId, `phase:${phase}`),
    queryFn: () => getMyScores(judgeId, { phase }),
  });

export const useMyCandidateScores = (judgeId: string, candidateId: string) =>
  useQuery({
    queryKey: judgingKeys.myScores(judgeId, `cand:${candidateId}`),
    queryFn: () => getMyScores(judgeId, { candidateId }),
  });

export const useLeaderboard = (phase: PhaseId) =>
  useQuery({
    queryKey: judgingKeys.leaderboard(phase),
    queryFn: () => getLeaderboard(phase),
  });

export const useFinalizeStatus = (phase: PhaseId, enabled = true) =>
  useQuery({
    queryKey: ["judging", "finalize", phase],
    queryFn: () => getFinalizeStatus(phase),
    enabled,
  });

export const useJudges = () =>
  useQuery({ queryKey: judgingKeys.judges, queryFn: getJudges });

export function useInvalidateJudging() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["judging"] }),
      qc.invalidateQueries({ queryKey: ["stages"] }),
      qc.invalidateQueries({ queryKey: candidateKeys.all }),
      qc.invalidateQueries({ queryKey: ["activity"] }),
    ]);
}

export function useSaveScore() {
  const invalidate = useInvalidateJudging();
  return useMutation({ mutationFn: saveScore, onSuccess: invalidate });
}

export function useDisqualify() {
  const invalidate = useInvalidateJudging();
  return useMutation({
    mutationFn: ({ ids, reason }: { ids: string[]; reason: string }) =>
      disqualifyCandidates(ids, reason),
    onSuccess: invalidate,
  });
}

export function useFinalize(phase: PhaseId) {
  const invalidate = useInvalidateJudging();
  return useMutation({
    mutationFn: (passedIds: string[]) => finalizePhase(phase, passedIds),
    onSuccess: invalidate,
  });
}
