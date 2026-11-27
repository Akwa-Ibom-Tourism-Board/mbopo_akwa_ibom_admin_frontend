import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getRegistrationSetting,
  updateRegistrationSetting,
  type RegistrationStatus,
} from ".";

const KEY = ["registration-setting"] as const;

export const useRegistrationSetting = () =>
  useQuery({ queryKey: KEY, queryFn: getRegistrationSetting });

export function useUpdateRegistrationSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: RegistrationStatus) =>
      updateRegistrationSetting(status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
