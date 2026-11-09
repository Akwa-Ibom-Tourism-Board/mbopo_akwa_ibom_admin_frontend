import { request } from "@/lib/http";
import type { Participant } from "../types";

// GET /admin/participants/:id is keyed by the User's own id (see
// candidate.helpers.ts's serializeCandidateForViewer's `applicantId`) —
// unlike /admin/contestants/:id, which is keyed by the Application id and
// only ever exists once someone has submitted.
export async function getParticipant(id: string): Promise<Participant> {
  return request<Participant>(`/admin/participants/${id}`);
}

// Starts a complaint-style email thread with this participant — same
// Message/MessageReply shapes a complaint reply uses, so the conversation
// that results is just a normal row in the Complaints inbox (tagged
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
