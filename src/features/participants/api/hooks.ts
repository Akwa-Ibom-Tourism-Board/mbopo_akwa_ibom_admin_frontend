import { useMutation, useQuery } from "@tanstack/react-query";
import { getParticipant, messageParticipant, getParticipantsCount } from ".";

export const participantKeys = {
  detail: (id: string) => ["participants", id] as const,
  counts: () => ["participants", "counts"] as const,
};

export const useParticipant = (id: string | undefined) =>
  useQuery({
    queryKey: participantKeys.detail(id ?? ""),
    queryFn: () => getParticipant(id!),
    enabled: !!id,
  });

export const useParticipantsCount = () =>
  useQuery({
    queryKey: participantKeys.counts(),
    queryFn: () => getParticipantsCount(),
  });

export function useMessageParticipant(id: string) {
  return useMutation({
    mutationFn: ({ subject, body }: { subject: string; body: string }) =>
      messageParticipant(id, subject, body),
  });
}
