import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCandidate,
  getCandidateEvents,
  getCandidates,
  updateCandidateDetails,
  updateCandidateProfile,
  uploadCandidateDocument,
  type UploadedFile,
} from ".";
import type { DocumentField } from "../types";
import type { SectionId } from "../schemas";
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

export function useUpdateCandidateDetails(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      section,
      values,
    }: {
      section: SectionId;
      values: Record<string, unknown>;
    }) => updateCandidateDetails(id, section, values),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: candidateKeys.all }),
        qc.invalidateQueries({ queryKey: ["candidate-events", id] }),
        qc.invalidateQueries({ queryKey: ["activity"] }),
      ]),
  });
}

// Admin / Super Admin only — callers gate it with can("candidates.viewActivity").
export const useCandidateEvents = (id: string, enabled: boolean) =>
  useQuery({
    queryKey: ["candidate-events", id],
    queryFn: () => getCandidateEvents(id),
    enabled,
  });

export function useUploadCandidateDocument(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      field,
      file,
    }: {
      field: DocumentField;
      file: UploadedFile;
    }) => uploadCandidateDocument(id, field, file),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: candidateKeys.all }),
        qc.invalidateQueries({ queryKey: ["candidate-events", id] }),
        qc.invalidateQueries({ queryKey: ["activity"] }),
      ]),
  });
}
