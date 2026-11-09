import type { Lga, SenatorialDistrict } from "@/lib/constants";
import type { Role } from "@/lib/rbac";
import type { CandidateStage, PhaseId } from "@/lib/phases";

export type { CandidateStage };

export type CandidateStatus =
  "active" | "advanced" | "eliminated" | "disqualified" | "winner";

export interface CandidateVideo {
  title: string;
  youtubeUrl: string;
}

export type ApplicationStatus = "draft" | "submitted";

// The 4 application file slots an admin may replace (never "avatar" — that
// comes from the verified NIN identity and is locked everywhere). Named
// exactly as the backend names them (configurations/cloudinary.ts PhotoField).
export type DocumentField =
  "certificateOfOrigin" | "fullImage" | "fullImage2" | "videoPitch";

/**
 * Mirrors exactly what GET /admin/contestants/:id (serializeCandidateForViewer)
 * returns — a flat, already-redacted record, not the backend's raw User +
 * Application tables. Fields below `candidates.view`'s base tier are
 * optional: Media only ever gets the base fields; `details`-tier fields
 * require `candidates.viewDetails`; `identity`-tier fields require
 * `candidates.viewIdentity`. See admin/helpers/candidate.helpers.ts.
 *
 * This list is always submitted-only, so `id`/`status` are never null here
 * — contrast with features/participants' `Participant`, the wider version
 * of this same shape returned by GET /admin/participants/:id, which can be
 * a draft or have no application at all yet.
 */
export interface Candidate {
  // ── Base tier (candidates.view — every role that can see candidates at all)
  id: string;
  applicantId: string;
  name: string;
  photo: string | null;
  lga: Lga | null;
  senatorialDistrict?: SenatorialDistrict;
  status: ApplicationStatus;
  referenceCode: string | null;
  submittedAt: string | null; // ISO
  bio: string | null;
  additionalPhotos: string[];
  additionalVideos: CandidateVideo[];
  voteCount: number;

  // ── Details tier (candidates.viewDetails — Judge/Head Judge/Admin/Super Admin)
  stage?: CandidateStage | null;
  phase?: PhaseId | null;
  candidateStatus?: CandidateStatus | null;
  disqualificationReason?: string | null;
  eliminatedAtPhase?: PhaseId | null;
  disqualifiedAtPhase?: PhaseId | null;
  middleName?: string | null;
  gender?: "male" | "female" | null;
  dateOfBirth?: string | null;
  email?: string | null;
  phone?: string | null;
  maritalStatus?: string | null;
  socialMedia?: string | null;
  nextOfKin?: string | null;
  nextOfKinPhone?: string | null;
  nextOfKinRelationship?: string | null;
  village?: string | null;
  residenceState?: string | null;
  city?: string | null;
  address?: string | null;
  education?: string | null;
  educationOther?: string | null;
  institution?: string | null;
  institutionOther?: string | null;
  occupation?: string | null;
  occupationOther?: string | null;
  talents?: string | null;
  languages?: string | null;
  initiative?: string | null;
  why?: string | null;
  certificateOfOriginUrl?: string | null;
  fullImageUrl?: string | null;
  fullImageUrl2?: string | null;
  videoPitchUrl?: string | null;
  // VIN is verified in the background after submission, never blocking it —
  // the outcome is a judging signal, so (unlike the raw VIN digits below)
  // it's in the details tier, available to Judge/Head Judge too.
  isVinVerified?: boolean | null;
  vinVerificationFailedReason?: string | null;

  // ── Identity tier (candidates.viewIdentity — Admin/Super Admin only)
  nin?: string | null;
  vin?: string | null;
  draftVin?: string | null;
}

export const DOCUMENT_URL_FIELDS: Record<DocumentField, keyof Candidate> = {
  certificateOfOrigin: "certificateOfOriginUrl",
  fullImage: "fullImageUrl",
  fullImage2: "fullImageUrl2",
  videoPitch: "videoPitchUrl",
};

export type PublicProfileUpdate = Pick<
  Candidate,
  "bio" | "additionalPhotos" | "additionalVideos"
>;

// One line in a candidate's own Activity tab (GET /admin/activity/candidate/:id).
export interface CandidateEvent {
  id: string;
  at: string; // ISO
  actorId: string | null;
  actorName: string;
  actorRole?: Role | null;
  summary: string;
}

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
