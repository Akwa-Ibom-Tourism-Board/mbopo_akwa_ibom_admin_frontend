// Same rules as the applicant platform (mbopo_akwa_ibom_design/src/lib/
// validation.ts) so staff-entered data passes everywhere the applicant's own
// would.

// Letters (any script), spaces, apostrophes, dots, hyphens — and it must start
// with a letter.
export const NAME_REGEX = /^[\p{L}][\p{L}\s'.-]*$/u;
export const NAME_MESSAGE = "Use letters only";

// Place / role names may contain a digit ("Uyo II") but need a real letter.
export const CONTAINS_LETTER_REGEX = /\p{L}/u;
export const CONTAINS_LETTER_MESSAGE = "This does not look like a valid entry";

export const wordCount = (value: string) =>
  value.trim().split(/\s+/).filter(Boolean).length;

// "uYo cITY" -> "Uyo city". Matches the backend's own backstop
// (applicants/application/application.helpers.ts toSentenceCase) — free text
// only, never codes, emails or phone numbers.
export function toSentenceCase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}
