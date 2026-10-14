import { recordActivity } from "@/features/activity-log/api";
import { MOCK_CANDIDATES } from "../data/mock-candidates";
import type { Candidate, PublicProfileUpdate } from "../types";

// Dummy data layer. Each function has the async signature a real HTTP call
// would have, so wiring the backend means replacing these bodies only — the
// components and react-query hooks above them don't change.
const delay = (ms = 150) => new Promise((r) => setTimeout(r, ms));

// In-memory "database": edits persist until the page reloads.
let store: Candidate[] = MOCK_CANDIDATES.map((c) => ({ ...c }));

export async function getCandidates(): Promise<Candidate[]> {
  await delay();
  return store.map((c) => ({ ...c }));
}

export async function getCandidate(id: string): Promise<Candidate | null> {
  await delay();
  const found = store.find((c) => c.id === id);
  return found ? { ...found } : null;
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
  if (changes)
    recordActivity("candidates", `${changes} on ${next.name}'s profile`);
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
