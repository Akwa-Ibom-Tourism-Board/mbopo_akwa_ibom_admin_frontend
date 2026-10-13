import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCandidate, getCandidates, updateCandidateProfile } from ".";
import type { PublicProfileUpdate } from "../types";

export const candidateKeys = {
  all: ["candidates"] as const,
  detail: (id: string) => ["candidates", id] as const,
};

export const useCandidates = () =>
  useQuery({ queryKey: candidateKeys.all, queryFn: getCandidates });

export const useCandidate = (id: string | undefined) =>
  useQuery({
    queryKey: candidateKeys.detail(id ?? ""),
    queryFn: () => getCandidate(id!),
    enabled: !!id,
  });

export function useUpdateCandidateProfile(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (update: PublicProfileUpdate) =>
      updateCandidateProfile(id, update),
    onSuccess: () => qc.invalidateQueries({ queryKey: candidateKeys.all }),
  });
}
