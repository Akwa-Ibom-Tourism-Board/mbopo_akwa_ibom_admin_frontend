import { ROLE_LABELS, type Role } from "@/lib/rbac";
import type { AdminUser } from "../types";

export interface BulkRow {
  key: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role | "";
  // Set when the server refused this row (e.g. email already used).
  serverError?: string;
}

let seed = 0;
export const newRow = (patch: Partial<BulkRow> = {}): BulkRow => ({
  key: seed++,
  firstName: "",
  lastName: "",
  email: "",
  role: "",
  ...patch,
});

export const isBlank = (r: BulkRow) =>
  !r.firstName.trim() && !r.lastName.trim() && !r.email.trim() && !r.role;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[\s_-]+/g, " ")
    .trim();

// "Head Judge", "head_judge", "head-judge", "customer service" … all work.
export function parseRole(text: string): Role | "" {
  const t = norm(text);
  if (!t) return "";
  const hit = (Object.keys(ROLE_LABELS) as Role[]).find(
    (r) => norm(r) === t || norm(ROLE_LABELS[r]) === t,
  );
  return hit ?? "";
}

// Parses text pasted from a spreadsheet or CSV: one person per line, columns
// separated by tabs, commas or semicolons —
//   first name, last name, email, role
// or, shorter,   full name, email, role
// A header row (mentions "email" but has no "@") is skipped.
export function parsePaste(text: string, defaultRole: Role | ""): BulkRow[] {
  const rows: BulkRow[] = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    if (!line.includes("@") && /e-?mail/i.test(line)) continue;
    const cells = line.split(/\t|,|;/).map((c) => c.trim());
    let firstName = "";
    let lastName = "";
    let email = "";
    let roleText = "";
    if (cells.length >= 4) {
      [firstName = "", lastName = "", email = "", roleText = ""] = cells;
    } else if (cells.length === 3 && cells[1]?.includes("@")) {
      const [name = "", e = "", r = ""] = cells;
      const [first = "", ...rest] = name.split(/\s+/);
      firstName = first;
      lastName = rest.join(" ");
      email = e;
      roleText = r;
    } else {
      // Best effort: pick out whichever cell looks like an email.
      email = cells.find((c) => c.includes("@")) ?? "";
      const others = cells.filter((c) => c !== email);
      [firstName = "", lastName = "", roleText = ""] = others;
    }
    rows.push(
      newRow({
        firstName,
        lastName,
        email,
        role: parseRole(roleText) || defaultRole,
      }),
    );
  }
  return rows;
}

// Per-row problems, keyed by row key. Blank rows are ignored.
export function validateRows(
  rows: BulkRow[],
  existing: AdminUser[],
  allowed: readonly Role[],
): Record<number, string> {
  const problems: Record<number, string> = {};
  const seen = new Set<string>();
  const activeHead = existing.find((u) => u.role === "head_judge" && u.active);
  let headRows = 0;

  for (const r of rows) {
    if (isBlank(r)) continue;
    const email = r.email.trim().toLowerCase();
    let problem: string | undefined;
    if (!r.firstName.trim() || !r.lastName.trim())
      problem = "Enter a first and last name";
    else if (!EMAIL.test(email)) problem = "Enter a valid email";
    else if (!r.role) problem = "Choose a role";
    else if (!allowed.includes(r.role))
      problem = `You can't add ${ROLE_LABELS[r.role]} accounts`;
    else if (existing.some((u) => u.email.toLowerCase() === email))
      problem = "This email already has an account";
    else if (seen.has(email)) problem = "Same email appears twice in this list";
    else if (r.role === "head_judge") {
      headRows++;
      if (activeHead)
        problem = `${activeHead.firstName} ${activeHead.lastName} is already the Head Judge`;
      else if (headRows > 1) problem = "Only one Head Judge is allowed";
    }
    if (email) seen.add(email);
    if (problem) problems[r.key] = problem;
  }
  return problems;
}
