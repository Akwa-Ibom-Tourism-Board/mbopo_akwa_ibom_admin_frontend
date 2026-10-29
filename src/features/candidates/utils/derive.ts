import { differenceInYears, parseISO } from "date-fns";
import { MAXIMUM_ELIGIBLE_AGE, MINIMUM_ELIGIBLE_AGE } from "@/lib/applicationOptions";
import type { Candidate } from "../types";

export const ageOf = (dateOfBirth: string, on: Date = new Date()) =>
  differenceInYears(on, parseISO(dateOfBirth));

// Backend eligibility band. A judge/organiser decision, so we show it rather
// than enforce it. Null when the viewer's role doesn't carry
// candidates.viewDetails (dateOfBirth is only ever present then anyway).
export function eligibility(dateOfBirth: string | null | undefined) {
  if (!dateOfBirth) return { age: null, eligible: null, band: `${MINIMUM_ELIGIBLE_AGE}–${MAXIMUM_ELIGIBLE_AGE}` };
  const age = ageOf(dateOfBirth);
  return {
    age,
    eligible: age >= MINIMUM_ELIGIBLE_AGE && age <= MAXIMUM_ELIGIBLE_AGE,
    band: `${MINIMUM_ELIGIBLE_AGE}–${MAXIMUM_ELIGIBLE_AGE}`,
  };
}

// "Other" in a dropdown is replaced by what was typed beside it.
export const occupationLabel = (c: Pick<Candidate, "occupation" | "occupationOther">) =>
  c.occupation === "Other" && c.occupationOther ? c.occupationOther : c.occupation;

export const institutionLabel = (c: Pick<Candidate, "institution" | "institutionOther">) =>
  c.institution === "Other" && c.institutionOther ? c.institutionOther : c.institution;

// NIN / VIN are masked for anyone without the identity capability, keeping only
// the last few characters so a record can still be told apart.
export const maskId = (value: string | null | undefined, visible = 3) =>
  !value ? "—" : `${"•".repeat(Math.max(value.length - visible, 4))}${value.slice(-visible)}`;
