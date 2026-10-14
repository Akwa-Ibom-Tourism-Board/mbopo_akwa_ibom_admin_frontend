import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUser,
  createUsers,
  getUsers,
  resetPassword,
  setUserActive,
  updateUser,
} from ".";
import type { UserUpdate } from "../types";

const KEY = ["users"] as const;

export const useUsers = () => useQuery({ queryKey: KEY, queryFn: getUsers });

function useInvalidating<A, R>(fn: (arg: A) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => Promise.all([qc.invalidateQueries({ queryKey: KEY })]),
  });
}

export const useCreateUser = () => useInvalidating(createUser);
export const useCreateUsers = () => useInvalidating(createUsers);
// gcTime 0: the temporary password this returns must not linger in React
// Query's mutation cache — the dialog shows it once and then it is gone.
export function useResetPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: resetPassword,
    gcTime: 0,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
export const useUpdateUser = () =>
  useInvalidating(({ id, patch }: { id: string; patch: UserUpdate }) =>
    updateUser(id, patch),
  );
export const useSetUserActive = () =>
  useInvalidating(({ id, active }: { id: string; active: boolean }) =>
    setUserActive(id, active),
  );
