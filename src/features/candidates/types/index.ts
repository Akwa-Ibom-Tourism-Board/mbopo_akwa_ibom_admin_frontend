import type { Lga, SenatorialDistrict } from "@/lib/constants";
import type { Role } from "@/lib/rbac";

import type { CandidateStage, PhaseId } from "@/lib/phases";

export type { CandidateStage };

// "eliminated" = not selected by the judges at a cut (a normal competitive
// outcome); "disqualified" = broke a rule and always carries a reason.
export type CandidateStatus =
  "active" | "advanced" | "eliminated" | "disqualified" | "winner";

export interface CandidateVideo {
  title: string;
  youtubeUrl: string;
}

export type Gender = "male" | "female";
export type ApplicationStatus = "draft" | "submitted";

// The file slots an applicant has, named exactly as the backend names them
// (configurations/cloudinary.ts UPLOAD_FIELDS). "avatar" lives on the account
// (User.avatarUrl); the rest are on the Application.
export type DocumentField =
  "avatar" | "certificateOfOrigin" | "fullImage" | "fullImage2" | "videoPitch";

// One uploaded file. `publicId` is the Cloudinary public_id the backend keeps
// beside every URL (mbopo/<env>/applications/<applicantId>/<field>).
export interface CandidateDocument {
  url: string;
  publicId: string;
  fileName?: string;
  mimeType?: string;
  bytes?: number;
  uploadedAt: string; // ISO
  // "Applicant" for their own upload, otherwise the staff member's name. The
  // role lets the page show "an administrator" for a Super Admin's upload.
  uploadedBy: string;
  uploadedByRole: Role | "applicant";
}

// Mirrors the backend's User + Application tables (mbopo_akwa_ibom_backend:
// auth/User.ts and applicants/application/Application.ts). Field names follow
// the backend, with two readability exceptions the whole admin app already
// uses: `lga` is the backend's `localGovernment`, and `why` also appears as the
// derived `story`.
export interface Candidate {
  id: string;

  // ── Account identity (User) — comes from the applicant's NIN/VIN check
  firstName: string;
  lastName: string;
  middleName?: string;
  gender: Gender;
  dateOfBirth: string; // ISO date
  nin: string; // 11 digits
  vin: string; // 19 characters
  ward?: string;
  lga: Lga; // backend: localGovernment
  senatorialDistrict: SenatorialDistrict; // derived from lga
  identityVerified: boolean;
  // null = no submit-time VIN check has run yet — NOT "failed".
  isVinVerified: boolean | null;
  vinVerificationFailedReason?: string;
  email: string;
  emailVerified: boolean;

  // ── Application
  phone: string;
  socialMedia?: string;
  nextOfKin: string;
  nextOfKinPhone: string;
  nextOfKinRelationship: string;
  village: string;
  residenceState: string;
  city: string;
  address: string;
  education: string;
  institution?: string;
  institutionOther?: string; // only when institution is "Other"
  occupation: string;
  occupationOther?: string; // only when occupation is "Other"
  talents: string;
  languages: string;
  initiative?: string;
  why: string;
  declarationIdentity: boolean;
  declarationAccuracy: boolean;
  declarationTerms: boolean;
  applicationStatus: ApplicationStatus;
  referenceCode: string;
  submittedAt?: string; // ISO
  appliedAt: string; // ISO — when the application was started

  // ── Uploaded files
  documents: Partial<Record<DocumentField, CandidateDocument>>;

  // ── Display fields derived from the above (see utils/derive.ts) so the rest
  // of the app can keep using short names. Never edit these directly.
  name: string;
  photo: string;
  applicantPhotos: string[];
  videoPitchUrl?: string;
  story: string;

  // ── Judging state. `phase` is the stage of elimination the candidate is in
  // (or last competed in); `stage` is the broader stage it belongs to, kept in
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

  // ── Public profile content (Media-managed)
  bio?: string;
  additionalPhotos?: string[];
  additionalVideos?: CandidateVideo[];

  // ── Voting (read from the voting platform's own data)
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
