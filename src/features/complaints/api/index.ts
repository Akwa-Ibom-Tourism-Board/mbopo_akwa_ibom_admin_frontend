import { request } from "@/lib/http";
import type { Complaint, ComplaintStatus } from "../types";

export async function getComplaints(): Promise<Complaint[]> {
  return request<Complaint[]>("/admin/complaints");
}

export async function getComplaint(id: string): Promise<Complaint | null> {
  try {
    return await request<Complaint>(`/admin/complaints/${id}`);
  } catch {
    return null;
  }
}

export async function replyToComplaint(id: string, body: string): Promise<void> {
  if (!body.trim()) throw new Error("Write a reply first.");
  await request(`/admin/complaints/${id}/reply`, { method: "POST", body: JSON.stringify({ body }) });
}

export async function updateStatus(id: string, status: ComplaintStatus): Promise<void> {
  await request(`/admin/complaints/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export async function reassignComplaint(id: string, assignedToId: string): Promise<void> {
  await request(`/admin/complaints/${id}/reassign`, {
    method: "PATCH",
    body: JSON.stringify({ assignedToId }),
  });
}
