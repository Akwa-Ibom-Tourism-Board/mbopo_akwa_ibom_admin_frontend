import type { Lga, SenatorialDistrict } from "@/lib/constants";

export type CandidateStage =
  "lga_selection" | "senatorial_selection" | "grand_finale";

export type CandidateStatus = "active" | "advanced" | "disqualified" | "winner";

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
  // Judging state. `stage` is the stage the candidate is currently in (or last
  // competed in); `advanced` means a decision to move on has been made and the
  // next stage hasn't opened yet. Only the judging workflow changes these.
  stage: CandidateStage;
  status: CandidateStatus;
  disqualificationReason?: string;
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
  disqualified: "Disqualified",
  winner: "Winner",
};
