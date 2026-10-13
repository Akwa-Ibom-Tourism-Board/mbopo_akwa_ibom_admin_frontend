import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getComplaint,
  getComplaints,
  reassignComplaint,
  replyToComplaint,
  updateStatus,
} from ".";
import type { ComplaintStatus } from "../types";

const KEY = ["complaints"] as const;

export const useComplaints = () =>
  useQuery({ queryKey: KEY, queryFn: getComplaints });

export const useComplaint = (id: string | undefined) =>
  useQuery({
    queryKey: [...KEY, id],
    queryFn: () => getComplaint(id!),
    enabled: !!id,
  });

function useInvalidating<A, R>(fn: (arg: A) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export const useReply = (id: string) =>
  useInvalidating((body: string) => replyToComplaint(id, body));
export const useUpdateStatus = (id: string) =>
  useInvalidating((status: ComplaintStatus) => updateStatus(id, status));
export const useReassign = (id: string) =>
  useInvalidating((assignedToId: string) =>
    reassignComplaint(id, assignedToId),
  );
