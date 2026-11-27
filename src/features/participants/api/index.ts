import { request } from "@/lib/http";
import type { Participant, ParticipantCounts } from "../types";

// GET /admin/participants/:id is keyed by the User's own id (see
// candidate.helpers.ts's serializeCandidateForViewer's `applicantId`) —
// unlike /admin/contestants/:id, which is keyed by the Application id and
// only ever exists once someone has submitted.
export async function getParticipant(id: string): Promise<Participant> {
  return request<Participant>(`/admin/participants/${id}`);
}

// Starts a complaint-style email thread with this participant — same
// Message/MessageReply shapes a complaint reply uses, so the conversation
// that results is just a normal row in the Messages inbox (tagged
// channel: "admin") rather than a separate parallel system.
export async function messageParticipant(
  id: string,
  subject: string,
  body: string,
): Promise<{ messageId: string }> {
  return request<{ messageId: string }>(`/admin/participants/${id}/messages`, {
    method: "POST",
    body: JSON.stringify({ subject, body }),
  });
}

export async function getParticipantsCount(): Promise<ParticipantCounts> {
  return request<ParticipantCounts>(`/admin/participants/counts`);
}

export type ContactsStatus =
  "all" | "not_started" | "in_progress" | "submitted";

export interface ContactsQuery {
  status?: ContactsStatus;
  // Which registration step an in-progress applicant is stuck at (1-5) —
  // only meaningful alongside status "in_progress".
  step?: number;
}

export interface ContactsResult {
  count: number;
  emails: string[];
  phones: string[];
}

// Deliberately not paginated — this returns every match (see the backend
// contacts.service.ts), so "copy all emails" actually copies all of them,
// not just whatever page happened to be on screen.
export async function getContacts(
  query: ContactsQuery = {},
): Promise<ContactsResult> {
  const params = new URLSearchParams();
  if (query.status && query.status !== "all")
    params.set("status", query.status);
  if (query.step) params.set("step", String(query.step));
  const qs = params.toString();
  return request(`/admin/participants/contacts${qs ? `?${qs}` : ""}`);
}
