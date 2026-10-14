import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { candidateKeys } from "@/features/candidates/api/hooks";
import type { PhaseId } from "@/lib/phases";
import {
  disqualifyCandidates,
  closeStage,
  getFinalizeStatus,
  getJudges,
  getLeaderboard,
  getMyScores,
  getResultsStandings,
  reopenStage,
  saveScore,
  submitResults,
  submitResultsAndClose,
} from ".";

export const judgingKeys = {
  myScores: (judgeId: string, key: string) =>
    ["judging", "scores", judgeId, key] as const,
  leaderboard: (phase: PhaseId) => ["judging", "leaderboard", phase] as const,
  judges: (phase: PhaseId) => ["judging", "judges", phase] as const,
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

export const useJudges = (phase: PhaseId) =>
  useQuery({
    queryKey: judgingKeys.judges(phase),
    queryFn: () => getJudges(phase),
  });

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

export function useSubmitResults(phase: PhaseId) {
  const invalidate = useInvalidateJudging();
  return useMutation({
    mutationFn: (passedIds: string[]) => submitResults(phase, passedIds),
    onSuccess: invalidate,
  });
}

export function useSubmitResultsAndClose(phase: PhaseId) {
  const invalidate = useInvalidateJudging();
  return useMutation({
    mutationFn: (passedIds: string[]) =>
      submitResultsAndClose(phase, passedIds),
    onSuccess: invalidate,
  });
}

export function useCloseStage() {
  const invalidate = useInvalidateJudging();
  return useMutation({ mutationFn: closeStage, onSuccess: invalidate });
}

// For whoever may submit results (Head Judge, Super Admin).
export const useResultsStandings = (phase: PhaseId, enabled: boolean) =>
  useQuery({
    queryKey: ["judging", "standings", phase],
    queryFn: () => getResultsStandings(phase),
    enabled,
  });

export function useReopenStage() {
  const invalidate = useInvalidateJudging();
  return useMutation({ mutationFn: reopenStage, onSuccess: invalidate });
}
