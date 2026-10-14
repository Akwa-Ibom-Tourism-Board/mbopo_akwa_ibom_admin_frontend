import { addDays, addMinutes, formatISO, parseISO } from "date-fns";
import { phaseTitle } from "@/lib/phases";
import { MOCK_CANDIDATES } from "./mock-candidates";
import type { CandidateEvent, CandidateEventKind } from "../types";

// Seed history for every candidate's Activity tab: their own journey on the
// applicant platform, then what happened to them in the competition.
function eventsFor(index: number): CandidateEvent[] {
  const c = MOCK_CANDIDATES[index]!;
  const out: CandidateEvent[] = [];
  let n = 0;
  const add = (
    at: Date,
    kind: CandidateEventKind,
    summary: string,
    who: Partial<
      Pick<CandidateEvent, "actorType" | "actorName" | "actorRole">
    > = {},
  ) =>
    out.push({
      id: `${c.id}-e${n++}`,
      candidateId: c.id,
      at: formatISO(at),
      actorType: who.actorType ?? "applicant",
      actorName: who.actorName ?? c.name,
      actorRole: who.actorRole,
      kind,
      summary,
    });

  const started = parseISO(c.appliedAt);
  add(addDays(started, -2), "account", "Created an account");
  add(
    addMinutes(addDays(started, -2), 12),
    "account",
    "Verified their email address",
  );
  add(
    addMinutes(addDays(started, -2), 25),
    "identity",
    "Verified their identity (NIN)",
  );
  add(started, "application", "Started the application");
  add(addMinutes(started, 6), "document", "Uploaded a profile photo");
  if (index % 3 === 0)
    add(addDays(started, 1), "application", "Saved the application as a draft");
  add(addDays(started, 1), "document", "Uploaded the certificate of origin");
  add(
    addMinutes(addDays(started, 1), 9),
    "document",
    "Uploaded two full-length photos",
  );
  add(
    addMinutes(addDays(started, 1), 30),
    "document",
    "Recorded and uploaded the video pitch",
  );
  const submitted = parseISO(c.submittedAt ?? c.appliedAt);
  add(
    submitted,
    "application",
    `Submitted the application (${c.referenceCode})`,
  );
  if (c.isVinVerified === false) {
    add(
      addMinutes(submitted, 1),
      "identity",
      `VIN check failed — ${c.vinVerificationFailedReason}`,
      {
        actorType: "system",
        actorName: "System",
      },
    );
  }
  add(addDays(submitted, 3), "account", "Signed in");
  if (index % 4 === 0)
    add(addDays(submitted, 4), "account", "Changed their password");

  // What staff did.
  if (index % 2 === 0 && c.bio) {
    add(
      new Date("2026-10-05T10:00:00Z"),
      "staff",
      "Public profile updated — added a bio",
      {
        actorType: "staff",
        actorName: "Mfon Bassey",
        actorRole: "media",
      },
    );
  }
  const lgaClose = new Date("2026-09-18T16:00:00Z");
  if (c.status === "advanced") {
    add(lgaClose, "judging", `Finalized through ${phaseTitle("lga")}`, {
      actorType: "staff",
      actorName: "Mbuk Inyang",
      actorRole: "head_judge",
    });
  } else if (c.status === "eliminated") {
    add(lgaClose, "judging", `Not selected at ${phaseTitle("lga")}`, {
      actorType: "staff",
      actorName: "Mbuk Inyang",
      actorRole: "head_judge",
    });
  } else if (c.status === "disqualified") {
    add(
      new Date("2026-09-05T11:30:00Z"),
      "judging",
      `Disqualified at ${phaseTitle("lga")} — ${c.disqualificationReason}`,
      {
        actorType: "staff",
        actorName: "Idara Okon",
        actorRole: "judge",
      },
    );
  }
  return out;
}

export const MOCK_CANDIDATE_EVENTS: CandidateEvent[] = MOCK_CANDIDATES.flatMap(
  (_, i) => eventsFor(i),
);
