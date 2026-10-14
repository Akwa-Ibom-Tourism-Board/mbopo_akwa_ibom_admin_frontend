import { differenceInYears, parseISO } from "date-fns";
import {
  MAXIMUM_ELIGIBLE_AGE,
  MINIMUM_ELIGIBLE_AGE,
} from "@/lib/applicationOptions";
import type { Candidate } from "../types";

export const fullName = (c: Pick<Candidate, "firstName" | "lastName">) =>
  `${c.firstName} ${c.lastName}`;

export const ageOf = (dateOfBirth: string, on: Date = new Date()) =>
  differenceInYears(on, parseISO(dateOfBirth));

// Backend eligibility band. A judge/organiser decision, so we show it rather
// than enforce it.
export function eligibility(dateOfBirth: string) {
  const age = ageOf(dateOfBirth);
  return {
    age,
    eligible: age >= MINIMUM_ELIGIBLE_AGE && age <= MAXIMUM_ELIGIBLE_AGE,
    band: `${MINIMUM_ELIGIBLE_AGE}–${MAXIMUM_ELIGIBLE_AGE}`,
  };
}

// "Other" in a dropdown is replaced by what was typed beside it.
export const occupationLabel = (
  c: Pick<Candidate, "occupation" | "occupationOther">,
) =>
  c.occupation === "Other" && c.occupationOther
    ? c.occupationOther
    : c.occupation;

export const institutionLabel = (
  c: Pick<Candidate, "institution" | "institutionOther">,
) =>
  c.institution === "Other" && c.institutionOther
    ? c.institutionOther
    : c.institution;

// NIN / VIN are masked for anyone without the identity capability, keeping only
// the last few characters so a record can still be told apart.
export const maskId = (value: string | undefined, visible = 3) =>
  !value
    ? "—"
    : `${"•".repeat(Math.max(value.length - visible, 4))}${value.slice(-visible)}`;

// Recomputes the short display fields from their sources. Call after any edit
// to names, documents or the story so they never drift.
export function deriveDisplayFields<T extends Candidate>(c: T): T {
  const docs = c.documents;
  return {
    ...c,
    name: fullName(c),
    photo: docs.avatar?.url ?? c.photo,
    applicantPhotos: [docs.fullImage?.url, docs.fullImage2?.url].filter(
      (u): u is string => !!u,
    ),
    videoPitchUrl: docs.videoPitch?.url,
    story: c.why,
  };
}
