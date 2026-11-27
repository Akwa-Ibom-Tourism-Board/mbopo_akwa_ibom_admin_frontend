import { request } from "@/lib/http";
import type { PageMeta } from "@/shared/types/pagination";
import type { Complaint, ComplaintStatus } from "../types";

export interface ComplaintListQuery {
  search?: string;
  status?: string;
  channel?: string;
  source?: string;
  page?: number;
  limit?: number;
}

export async function getComplaints(
  query: ComplaintListQuery = {},
): Promise<{ complaints: Complaint[]; meta: PageMeta }> {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.channel) params.set("channel", query.channel);
  if (query.source) params.set("source", query.source);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return request(`/admin/complaints${qs ? `?${qs}` : ""}`);
}

export async function getComplaint(id: string): Promise<Complaint | null> {
  try {
    return await request<Complaint>(`/admin/complaints/${id}`);
  } catch {
    return null;
  }
}

export async function replyToComplaint(
  id: string,
  body: string,
): Promise<void> {
  if (!body.trim()) throw new Error("Write a reply first.");
  await request(`/admin/complaints/${id}/reply`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export async function updateStatus(
  id: string,
  status: ComplaintStatus,
): Promise<void> {
  await request(`/admin/complaints/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function reassignComplaint(
  id: string,
  assignedToId: string,
): Promise<void> {
  await request(`/admin/complaints/${id}/reassign`, {
    method: "PATCH",
    body: JSON.stringify({ assignedToId }),
  });
}

export async function resendReplyEmail(
  id: string,
  replyId: string,
): Promise<void> {
  await request(`/admin/complaints/${id}/replies/${replyId}/resend-email`, {
    method: "POST",
  });
}
