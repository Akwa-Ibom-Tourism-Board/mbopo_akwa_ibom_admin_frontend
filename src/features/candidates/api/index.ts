import { request } from "@/lib/http";
import { uploadCandidateDocument as uploadDocumentToCloudinary } from "@/lib/cloudinary";
import { LGA_TO_DISTRICT } from "@/lib/constants";
import { sectionSchemas, type SectionId } from "../schemas";
import type {
  Candidate,
  CandidateEvent,
  DocumentField,
  PublicProfileUpdate,
} from "../types";

export async function getCandidates(): Promise<Candidate[]> {
  const result = await request<{ contestants: Candidate[] }>(
    "/admin/contestants",
  );
  return result.contestants;
}

export async function getCandidate(id: string): Promise<Candidate | null> {
  try {
    return await request<Candidate>(`/admin/contestants/${id}`);
  } catch {
    return null;
  }
}

export async function updateCandidateProfile(
  id: string,
  update: PublicProfileUpdate,
): Promise<Candidate> {
  return request<Candidate>(`/admin/contestants/${id}/profile`, {
    method: "PATCH",
    body: JSON.stringify(update),
  });
}

export async function getCandidateEvents(
  id: string,
): Promise<CandidateEvent[]> {
  return request<CandidateEvent[]>(`/admin/activity/candidate/${id}`);
}

// Section field names in this app's forms don't all match the backend's
// Application column names 1:1 — translated here so the backend only ever
// sees its own field names. "ward" has no backend column (legacy, unused —
// see the registration rework) so it's dropped rather than sent.
function toBackendPayload(section: SectionId, values: Record<string, unknown>) {
  const {
    ward: _ward,
    lga,
    ...rest
  } = values as Record<string, unknown> & {
    ward?: unknown;
    lga?: string;
  };
  return lga !== undefined ? { ...rest, localGovernment: lga } : rest;
}

export async function updateCandidateDetails(
  id: string,
  section: SectionId,
  raw: Record<string, unknown>,
): Promise<Candidate> {
  const parsed = sectionSchemas[section].safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid details");
  }
  const values = { ...(parsed.data as Record<string, string | undefined>) };
  if (section === "work") {
    if (values.education !== "Other") values.educationOther = undefined;
    if (values.institution !== "Other") values.institutionOther = undefined;
    if (values.occupation !== "Other") values.occupationOther = undefined;
  }
  return request<Candidate>(`/admin/contestants/${id}/details`, {
    method: "PATCH",
    body: JSON.stringify(toBackendPayload(section, values)),
  });
}

export interface UploadProgress {
  onProgress?: (percent: number) => void;
}

// Signs, uploads straight to Cloudinary, then saves the result — see
// lib/cloudinary.ts's uploadCandidateDocument for the signed-upload half
// of this (POST /admin/contestants/:id/document-signature).
export async function uploadCandidateDocument(
  id: string,
  field: DocumentField,
  file: File,
  options: UploadProgress = {},
): Promise<Candidate> {
  const { url, publicId } = await uploadDocumentToCloudinary(
    id,
    field,
    file,
    options,
  );
  return request<Candidate>(`/admin/contestants/${id}/document`, {
    method: "PATCH",
    body: JSON.stringify({ field, url, publicId }),
  });
}

// Used by EditSectionDialog's live preview of how the LGA change would
// also move the senatorial district — purely local derivation, no request.
export function deriveSenatorialDistrict(lga: string): string | undefined {
  return LGA_TO_DISTRICT[lga as keyof typeof LGA_TO_DISTRICT];
}
