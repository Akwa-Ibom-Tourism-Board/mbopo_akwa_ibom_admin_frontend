import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { candidateKeys } from "@/features/candidates/api/hooks";
import type { PhaseId } from "@/lib/phases";
import { getPhaseStates, openPhase } from ".";

export const stageKeys = { all: ["stages"] as const };

export const usePhaseStates = () =>
  useQuery({ queryKey: stageKeys.all, queryFn: getPhaseStates });

export function useOpenPhase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: PhaseId) => openPhase(id),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: stageKeys.all }),
        qc.invalidateQueries({ queryKey: candidateKeys.all }),
        qc.invalidateQueries({ queryKey: ["judging"] }),
        qc.invalidateQueries({ queryKey: ["activity"] }),
      ]),
  });
}
