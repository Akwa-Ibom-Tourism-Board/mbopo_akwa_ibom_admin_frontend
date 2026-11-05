import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getComplaint,
  getComplaints,
  reassignComplaint,
  replyToComplaint,
  resendReplyEmail,
  updateStatus,
} from ".";
import type { Complaint, ComplaintStatus } from "../types";

const KEY = ["complaints"] as const;

export const useComplaints = () =>
  useQuery({ queryKey: KEY, queryFn: getComplaints });

export const useComplaint = (id: string | undefined) =>
  useQuery({
    queryKey: [...KEY, id],
    queryFn: () => getComplaint(id!),
    enabled: !!id,
    // A reply's email send is async (queued, ~5s delay, then the actual
    // send) — keep polling every few seconds while any reply is still
    // "pending" so staff see it flip to sent/failed without a manual
    // refresh, then stop once nothing is left in flight.
    refetchInterval: (query) => {
      const data = query.state.data as Complaint | null | undefined;
      const hasPending = data?.messages.some(
        (m) => m.from === "staff" && m.emailStatus === "pending",
      );
      return hasPending ? 3000 : false;
    },
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
export const useResendReplyEmail = (id: string) =>
  useInvalidating((replyId: string) => resendReplyEmail(id, replyId));
