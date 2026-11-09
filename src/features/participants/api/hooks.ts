import { useMutation, useQuery } from "@tanstack/react-query";
import { getParticipant, messageParticipant } from ".";

export const participantKeys = {
  detail: (id: string) => ["participants", id] as const,
};

export const useParticipant = (id: string | undefined) =>
  useQuery({
    queryKey: participantKeys.detail(id ?? ""),
    queryFn: () => getParticipant(id!),
    enabled: !!id,
  });

export function useMessageParticipant(id: string) {
  return useMutation({
    mutationFn: ({ subject, body }: { subject: string; body: string }) =>
      messageParticipant(id, subject, body),
  });
}
