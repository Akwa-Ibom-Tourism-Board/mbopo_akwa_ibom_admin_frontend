import { useQuery } from "@tanstack/react-query";
import { getParticipant } from ".";

export const participantKeys = {
  detail: (id: string) => ["participants", id] as const,
};

export const useParticipant = (id: string | undefined) =>
  useQuery({
    queryKey: participantKeys.detail(id ?? ""),
    queryFn: () => getParticipant(id!),
    enabled: !!id,
  });
