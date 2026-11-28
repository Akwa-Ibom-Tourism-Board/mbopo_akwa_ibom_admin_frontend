import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  deleteApplicant,
  getApplicant,
  getApplicants,
  setApplicantActive,
  submitForApplicant,
  type ApplicantListQuery,
} from ".";
import { participantKeys } from "@/features/participants/api/hooks";
import { candidateKeys } from "@/features/candidates/api/hooks";

export const applicantKeys = {
  all: ["applicants"] as const,
  list: (query: ApplicantListQuery) => ["applicants", "list", query] as const,
  detail: (id: string) => ["applicants", id] as const,
};

export const useApplicants = (query: ApplicantListQuery = {}) =>
  useQuery({
    queryKey: applicantKeys.list(query),
    queryFn: () => getApplicants(query),
    placeholderData: keepPreviousData,
  });

export const useApplicant = (id: string | undefined) =>
  useQuery({
    queryKey: applicantKeys.detail(id ?? ""),
    queryFn: () => getApplicant(id!),
    enabled: !!id,
  });

export function useSetApplicantActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      setApplicantActive(id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: applicantKeys.all }),
  });
}

export function useDeleteApplicant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteApplicant(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: applicantKeys.all }),
  });
}

// Moves someone from Applicants to Contestants, so every list that cares
// about either (plus their shared participant counts/breakdown) needs to
// refetch, not just this one applicant's own cache entries.
export function useSubmitForApplicant(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => submitForApplicant(id),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: applicantKeys.all }),
        qc.invalidateQueries({ queryKey: candidateKeys.all }),
        qc.invalidateQueries({ queryKey: participantKeys.detail(id) }),
        qc.invalidateQueries({ queryKey: participantKeys.counts() }),
      ]),
  });
}
