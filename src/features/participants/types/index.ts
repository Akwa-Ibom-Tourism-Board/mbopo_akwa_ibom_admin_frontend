import type { Candidate, ApplicationStatus } from "@/features/candidates/types";

// The wider version of candidates/types' Candidate, for GET
// /admin/participants/:id — which, unlike the submitted-only
// /admin/contestants list, can return someone who's only registered
// (`id: null`, `status: null`) or mid-draft (`id` set, `status: "draft"`).
// A Candidate is always a valid Participant (narrower id/status), so every
// contestant-feature component built against `Candidate` still accepts data
// fetched this way — only the reverse needs guarding, which the unified
// detail page does explicitly (hiding edit actions/tabs that need a real
// Application id).
export type Participant = Omit<Candidate, "id" | "status"> & {
  id: string | null;
  status: ApplicationStatus | null;
};

// Where someone stands, derived from `status` alone — this is the three-way
// split the Participants tabs filter on.
export type ParticipantKind = "candidate" | "applicant" | "contestant";

export function participantKind(
  status: ApplicationStatus | null,
): ParticipantKind {
  if (status === "submitted") return "contestant";
  if (status === "draft") return "applicant";
  return "candidate";
}
