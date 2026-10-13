import type { Lga, SenatorialDistrict } from "@/lib/constants";

import type { CandidateStage, PhaseId } from "@/lib/phases";

export type { CandidateStage };

// "eliminated" = not selected by the judges at a cut (a normal competitive
// outcome); "disqualified" = broke a rule and always carries a reason.
export type CandidateStatus =
  "active" | "advanced" | "eliminated" | "disqualified" | "winner";

export type VerificationStatus = "verified" | "pending" | "failed";

export interface CandidateVideo {
  title: string;
  youtubeUrl: string;
}

// Mirrors the applicant platform's Application + User shape (display only —
// don't redesign these fields).
export interface Candidate {
  id: string;
  // From the application
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string; // ISO date
  lga: Lga;
  senatorialDistrict: SenatorialDistrict; // derived from lga
  education: string;
  occupation: string;
  ninStatus: VerificationStatus;
  vinStatus: VerificationStatus;
  photo: string;
  applicantPhotos: string[];
  videoPitchUrl?: string;
  story: string;
  appliedAt: string; // ISO
  // Judging state. `phase` is the stage of elimination the candidate is in (or
  // last competed in); `stage` is the broader stage it belongs to, kept in
  // sync. `advanced` means the Head Judge has finalized them through that
  // phase and they wait there until an Admin opens the next one. Only the
  // judging workflow changes these.
  phase: PhaseId;
  stage: CandidateStage;
  status: CandidateStatus;
  disqualificationReason?: string;
  // The phase where an eliminated / disqualified candidate's run ended.
  eliminatedAt?: PhaseId;
  disqualifiedAt?: PhaseId;
  // Public profile content (Media-managed)
  bio?: string;
  additionalPhotos?: string[];
  additionalVideos?: CandidateVideo[];
  // Voting (read from the voting platform's own data)
  voteCount?: number;
}

export type PublicProfileUpdate = Pick<
  Candidate,
  "bio" | "additionalPhotos" | "additionalVideos"
>;

export const STAGE_LABELS: Record<CandidateStage, string> = {
  lga_selection: "Local Government",
  senatorial_selection: "Senatorial District",
  grand_finale: "Grand Finale",
};

export const STATUS_LABELS: Record<CandidateStatus, string> = {
  active: "Active",
  advanced: "Advanced",
  eliminated: "Eliminated",
  disqualified: "Disqualified",
  winner: "Winner",
};
