import { recordActivity } from "@/features/activity-log/api";
import { readSessionUser } from "@/features/auth/session";
import { LGA_TO_DISTRICT } from "@/lib/constants";
import { can } from "@/lib/rbac";
import { toSentenceCase } from "@/lib/validation";
import {
  buildPublicId,
  getSlot,
  validateDocumentFile,
} from "../data/documents";
import { MOCK_CANDIDATE_EVENTS } from "../data/mock-events";
import { MOCK_CANDIDATES } from "../data/mock-candidates";
import {
  SECTION_FIELDS,
  SENTENCE_CASE_FIELDS,
  sectionSchemas,
  type SectionId,
} from "../schemas";
import type {
  Candidate,
  CandidateEvent,
  CandidateEventKind,
  DocumentField,
  PublicProfileUpdate,
} from "../types";
import { deriveDisplayFields } from "../utils/derive";

// Dummy data layer. Each function has the async signature a real HTTP call
// would have, so wiring the backend means replacing these bodies only — the
// components and react-query hooks above them don't change.
const delay = (ms = 150) => new Promise((r) => setTimeout(r, ms));

// In-memory "database": edits persist until the page reloads.
let store: Candidate[] = MOCK_CANDIDATES.map((c) => ({ ...c }));
let events: CandidateEvent[] = MOCK_CANDIDATE_EVENTS.map((e) => ({ ...e }));

// Appends to each candidate's own history (their Activity tab). Called by the
// other features when staff do something to a candidate — judging decisions,
// stage moves, profile edits. The actor comes from the dev-only session.
export function recordCandidateEvents(
  ids: string[],
  kind: CandidateEventKind,
  summary: string,
) {
  const actor = readSessionUser();
  const at = new Date().toISOString();
  events = [
    ...ids.map((candidateId) => ({
      id: `${candidateId}-e${Math.random().toString(36).slice(2, 9)}`,
      candidateId,
      at,
      actorType: (actor ? "staff" : "system") as CandidateEvent["actorType"],
      actorName: actor ? `${actor.firstName} ${actor.lastName}` : "System",
      actorRole: actor?.role,
      kind,
      summary,
    })),
    ...events,
  ];
}

// Admin and Super Admin only. A Super Admin's own actions are never shown to
// an Admin — to them those lines simply don't exist.
export async function getCandidateEvents(
  id: string,
): Promise<CandidateEvent[]> {
  await delay();
  const viewer = readSessionUser();
  if (viewer?.role !== "super_admin" && viewer?.role !== "admin") return [];
  return events
    .filter(
      (e) =>
        e.candidateId === id &&
        (viewer.role === "super_admin" || e.actorRole !== "super_admin"),
    )
    .sort((a, b) => b.at.localeCompare(a.at));
}

// What the signed-in person may know about a candidate. Media work only on
// public profiles, so they get a name and the public-profile content and
// NOTHING else — no stage, status, location, application, documents or scores.
// Enforced here (not just by hiding screens) so it holds when the real API
// replaces this layer.
function forViewer(c: Candidate): Candidate {
  if (readSessionUser()?.role !== "media") return { ...c };
  return {
    id: c.id,
    name: c.name,
    bio: c.bio,
    additionalPhotos: c.additionalPhotos,
    additionalVideos: c.additionalVideos,
  } as Candidate;
}

export async function getCandidates(): Promise<Candidate[]> {
  await delay();
  return store.map(forViewer);
}

export async function getCandidate(id: string): Promise<Candidate | null> {
  await delay();
  const found = store.find((c) => c.id === id);
  return found ? forViewer(found) : null;
}

const count = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

// "Added 2 photos and updated the bio" — so the event tracker says what
// actually changed on a profile, not just that it was saved.
function describeProfileChange(before: Candidate, after: Candidate) {
  const parts: string[] = [];
  const bioBefore = before.bio ?? "";
  const bioAfter = after.bio ?? "";
  if (bioBefore !== bioAfter) {
    parts.push(
      !bioBefore
        ? "added a bio"
        : !bioAfter
          ? "removed the bio"
          : "updated the bio",
    );
  }
  const photosBefore = new Set(before.additionalPhotos ?? []);
  const photosAfter = new Set(after.additionalPhotos ?? []);
  const addedPhotos = [...photosAfter].filter(
    (p) => !photosBefore.has(p),
  ).length;
  const removedPhotos = [...photosBefore].filter(
    (p) => !photosAfter.has(p),
  ).length;
  if (addedPhotos) parts.push(`added ${count(addedPhotos, "photo")}`);
  if (removedPhotos) parts.push(`removed ${count(removedPhotos, "photo")}`);
  const videosBefore = new Set(
    (before.additionalVideos ?? []).map((v) => v.youtubeUrl),
  );
  const videosAfter = new Set(
    (after.additionalVideos ?? []).map((v) => v.youtubeUrl),
  );
  const addedVideos = [...videosAfter].filter(
    (v) => !videosBefore.has(v),
  ).length;
  const removedVideos = [...videosBefore].filter(
    (v) => !videosAfter.has(v),
  ).length;
  if (addedVideos) parts.push(`added ${count(addedVideos, "video")}`);
  if (removedVideos) parts.push(`removed ${count(removedVideos, "video")}`);
  if (!parts.length) return "";
  const sentence =
    parts.length > 1
      ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`
      : parts[0]!;
  return sentence[0]!.toUpperCase() + sentence.slice(1);
}

export async function updateCandidateProfile(
  id: string,
  update: PublicProfileUpdate,
): Promise<Candidate> {
  await delay();
  const index = store.findIndex((c) => c.id === id);
  const current = store[index];
  if (!current) throw new Error("Candidate not found");
  const next = { ...current, ...update };
  store = store.map((c, i) => (i === index ? next : c));
  const changes = describeProfileChange(current, next);
  if (changes) {
    recordActivity("candidates", `${changes} on ${next.name}'s profile`);
    recordCandidateEvents(
      [id],
      "staff",
      `Public profile updated — ${changes[0]!.toLowerCase()}${changes.slice(1)}`,
    );
  }
  return forViewer(next);
}

const FIELD_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(SECTION_FIELDS).flatMap(([section, fields]) =>
    fields.map((f) => [
      f.name,
      // "Name" / "Phone" alone would be ambiguous in the trail.
      section === "kin"
        ? `next of kin ${f.label.toLowerCase()}`
        : f.label.toLowerCase(),
    ]),
  ),
);

// Corrects part of an applicant's application. Admin / Super Admin only, and
// only the editable sections — names, gender, date of birth, NIN, VIN, email
// and the profile photo come from the verified identity and are never touched
// (the schemas don't even contain them). Re-validated here with the same rules
// the form uses, then written the way the backend would: free text
// sentence-cased, "Other" notes dropped when the dropdown isn't "Other", and
// the senatorial district re-derived if the LGA changes. The log records WHICH
// fields changed, never the values (no phone numbers or addresses in the trail).
export async function updateCandidateDetails(
  id: string,
  section: SectionId,
  raw: Record<string, unknown>,
): Promise<Candidate> {
  await delay();
  const actor = readSessionUser();
  if (!can(actor?.role, "candidates.editDetails")) {
    throw new Error("Only an administrator can edit an applicant's details.");
  }
  const current = store.find((c) => c.id === id);
  if (!current) throw new Error("Candidate not found");
  const parsed = sectionSchemas[section].safeParse(raw);
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid details");

  const values = { ...(parsed.data as Record<string, string | undefined>) };
  if (section === "work") {
    if (values.institution !== "Other") values.institutionOther = undefined;
    if (values.occupation !== "Other") values.occupationOther = undefined;
  }

  const patch: Record<string, string | undefined> = {};
  const changed: string[] = [];
  const before = current as unknown as Record<string, string | undefined>;
  for (const [key, val] of Object.entries(values)) {
    let next = typeof val === "string" ? val.trim() : val;
    if (next === "") next = undefined;
    if (
      typeof next === "string" &&
      (SENTENCE_CASE_FIELDS as readonly string[]).includes(key) &&
      next !== before[key]
    ) {
      next = toSentenceCase(next);
    }
    if (next !== before[key]) {
      patch[key] = next;
      changed.push(key);
    }
  }
  if (!changed.length) return { ...current };

  const lgaChanged = "lga" in patch;
  const next = deriveDisplayFields({
    ...current,
    ...patch,
    ...(lgaChanged
      ? {
          senatorialDistrict:
            LGA_TO_DISTRICT[patch.lga as keyof typeof LGA_TO_DISTRICT],
        }
      : {}),
  } as Candidate);
  store = store.map((c) => (c.id === id ? next : c));

  const names = changed.map((k) => FIELD_LABELS[k] ?? k).join(", ");
  recordActivity(
    "candidates",
    lgaChanged
      ? `Changed the local government of ${next.name} from ${current.lga} to ${next.lga}${
          changed.length > 1
            ? ` and updated ${changed
                .filter((k) => k !== "lga")
                .map((k) => FIELD_LABELS[k] ?? k)
                .join(", ")}`
            : ""
        }`
      : `Updated ${names} on ${next.name}'s application`,
  );
  recordCandidateEvents([id], "staff", `Application updated — ${names}`);
  return { ...next };
}

export interface UploadedFile {
  url: string; // in the real flow, the Cloudinary secure_url
  fileName: string;
  mimeType: string;
  bytes: number;
}

// Adds or replaces one of an applicant's documents. Admin / Super Admin only.
// Mirrors the backend: the same slots, formats and size limits, and the same
// deterministic Cloudinary public_id (so a replacement overwrites the old
// asset). The profile photo is part of the verified identity and can't be
// replaced; nothing is ever removed — every required slot stays filled.
// Real flow: ask the backend for an upload signature, send the file straight to
// Cloudinary, then save the returned url + public_id on the application.
export async function uploadCandidateDocument(
  id: string,
  field: DocumentField,
  file: UploadedFile,
): Promise<Candidate> {
  await delay(300);
  const actor = readSessionUser();
  if (!can(actor?.role, "candidates.editDetails")) {
    throw new Error("Only an administrator can upload documents.");
  }
  if (field === "avatar") {
    throw new Error(
      "The profile photo comes from the verified identity and can't be replaced.",
    );
  }
  const current = store.find((c) => c.id === id);
  if (!current) throw new Error("Candidate not found");
  const problem = validateDocumentFile(field, file);
  if (problem) throw new Error(problem);

  const slot = getSlot(field);
  const replaced = !!current.documents[field];
  const next = deriveDisplayFields({
    ...current,
    documents: {
      ...current.documents,
      [field]: {
        url: file.url,
        publicId: buildPublicId(id, field),
        fileName: file.fileName,
        mimeType: file.mimeType,
        bytes: file.bytes,
        uploadedAt: new Date().toISOString(),
        uploadedBy: actor ? `${actor.firstName} ${actor.lastName}` : "Staff",
        uploadedByRole: actor?.role ?? "admin",
      },
    },
  } as Candidate);
  store = store.map((c) => (c.id === id ? next : c));

  const verb = replaced ? "Replaced" : "Uploaded";
  recordActivity(
    "candidates",
    `${verb} the ${slot.label.toLowerCase()} of ${next.name}`,
  );
  recordCandidateEvents(
    [id],
    "document",
    `${verb} the ${slot.label.toLowerCase()} (by staff)`,
  );
  return { ...next };
}

// Used by the judging feature's advance/disqualify actions.
export async function applyJudgingDecision(
  ids: string[],
  patch: Partial<
    Pick<
      Candidate,
      | "stage"
      | "phase"
      | "status"
      | "disqualificationReason"
      | "eliminatedAt"
      | "disqualifiedAt"
    >
  >,
): Promise<Candidate[]> {
  await delay();
  const set = new Set(ids);
  store = store.map((c) => (set.has(c.id) ? { ...c, ...patch } : c));
  return store.filter((c) => set.has(c.id)).map((c) => ({ ...c }));
}
