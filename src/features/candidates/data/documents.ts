import { MAX_IMAGE_BYTES } from "@/lib/constants";
import type { DocumentField } from "../types";

export interface DocumentSlot {
  field: DocumentField;
  label: string;
  hint: string;
  kind: "image" | "document" | "video";
  // File extensions the backend accepts for this slot (cloudinary.ts
  // ALLOWED_FORMATS) — Cloudinary enforces them, so we check before upload.
  formats: readonly string[];
  maxBytes: number;
  // Required for a submitted application: it can be replaced, never removed.
  requiredAtSubmit: boolean;
}

// The applicant platform caps the recorded pitch at 10MB / 30 seconds.
export const VIDEO_PITCH_MAX_BYTES = 10 * 1024 * 1024;

export const DOCUMENT_SLOTS: readonly DocumentSlot[] = [
  {
    field: "avatar",
    label: "Profile photo",
    hint: "The applicant's account photo.",
    kind: "image",
    formats: ["jpg", "jpeg", "png"],
    maxBytes: MAX_IMAGE_BYTES,
    requiredAtSubmit: false,
  },
  {
    field: "certificateOfOrigin",
    label: "Certificate of origin",
    hint: "Proof of local government origin. Image or PDF.",
    kind: "document",
    formats: ["jpg", "jpeg", "png", "pdf"],
    maxBytes: MAX_IMAGE_BYTES,
    requiredAtSubmit: true,
  },
  {
    field: "fullImage",
    label: "Full-length photo 1",
    hint: "A full-length photo of the applicant.",
    kind: "image",
    formats: ["jpg", "jpeg", "png"],
    maxBytes: MAX_IMAGE_BYTES,
    requiredAtSubmit: true,
  },
  {
    field: "fullImage2",
    label: "Full-length photo 2",
    hint: "A second full-length photo.",
    kind: "image",
    formats: ["jpg", "jpeg", "png"],
    maxBytes: MAX_IMAGE_BYTES,
    requiredAtSubmit: true,
  },
  {
    field: "videoPitch",
    label: "Video pitch",
    hint: "The applicant's recorded pitch (up to 30 seconds).",
    kind: "video",
    formats: ["mp4", "webm"],
    maxBytes: VIDEO_PITCH_MAX_BYTES,
    requiredAtSubmit: true,
  },
];

export const getSlot = (field: DocumentField) =>
  DOCUMENT_SLOTS.find((s) => s.field === field)!;

// Same deterministic scheme as the backend's buildPublicId().
export function buildPublicId(applicantId: string, field: DocumentField) {
  const scope = field === "avatar" ? "users" : "applications";
  return `mbopo/development/${scope}/${applicantId}/${field}`;
}
