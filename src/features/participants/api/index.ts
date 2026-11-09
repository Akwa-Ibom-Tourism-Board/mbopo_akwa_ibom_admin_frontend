import { request } from "@/lib/http";
import type { Participant } from "../types";

// GET /admin/participants/:id is keyed by the User's own id (see
// candidate.helpers.ts's serializeCandidateForViewer's `applicantId`) —
// unlike /admin/contestants/:id, which is keyed by the Application id and
// only ever exists once someone has submitted.
export async function getParticipant(id: string): Promise<Participant> {
  return request<Participant>(`/admin/participants/${id}`);
}
