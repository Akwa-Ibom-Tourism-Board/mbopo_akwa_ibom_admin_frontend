import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteApplicant,
  getApplicant,
  getApplicants,
  setApplicantActive,
  type ApplicantListQuery,
} from ".";

export const applicantKeys = {
  all: ["applicants"] as const,
  list: (query: ApplicantListQuery) => ["applicants", "list", query] as const,
  detail: (id: string) => ["applicants", id] as const,
};

export const useApplicants = (query: ApplicantListQuery = {}) =>
  useQuery({ queryKey: applicantKeys.list(query), queryFn: () => getApplicants(query) });

export const useApplicant = (id: string | undefined) =>
  useQuery({
    queryKey: applicantKeys.detail(id ?? ""),
    queryFn: () => getApplicant(id!),
    enabled: !!id,
  });

export function useSetApplicantActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => setApplicantActive(id, active),
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
