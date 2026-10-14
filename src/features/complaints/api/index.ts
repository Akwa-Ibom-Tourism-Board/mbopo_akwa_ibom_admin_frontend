import { recordActivity } from "@/features/activity-log/api";
import { readSessionUser } from "@/features/auth/session";
import { MOCK_COMPLAINTS } from "../data/mock-complaints";
import { STATUS_LABELS, type Complaint, type ComplaintStatus } from "../types";

// Dummy data layer. Replying and changing status are Customer Service
// actions; reassignment is Admin/Super Admin oversight (enforced in the UI
// via lib/rbac.ts — the real backend must enforce it too).
const delay = (ms = 150) => new Promise((r) => setTimeout(r, ms));

let store: Complaint[] = MOCK_COMPLAINTS.map((c) => ({
  ...c,
  messages: [...c.messages],
}));

const clone = (c: Complaint): Complaint => ({
  ...c,
  messages: [...c.messages],
});

function patchComplaint(id: string, fn: (c: Complaint) => Complaint) {
  const current = store.find((c) => c.id === id);
  if (!current) throw new Error("Complaint not found.");
  const next = { ...fn(current), updatedAt: new Date().toISOString() };
  store = store.map((c) => (c.id === id ? next : c));
  return clone(next);
}

export async function getComplaints(): Promise<Complaint[]> {
  await delay();
  return [...store]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(clone);
}

export async function getComplaint(id: string): Promise<Complaint | null> {
  await delay();
  const found = store.find((c) => c.id === id);
  return found ? clone(found) : null;
}

export async function replyToComplaint(
  id: string,
  body: string,
): Promise<Complaint> {
  await delay();
  if (!body.trim()) throw new Error("Write a reply first.");
  const actor = readSessionUser();
  const subject = store.find((c) => c.id === id)?.subject;
  if (subject)
    recordActivity("complaints", `Replied to complaint “${subject}”`);
  return patchComplaint(id, (c) => ({
    ...c,
    status: c.status === "open" ? "in_progress" : c.status,
    assignedToId: c.assignedToId ?? actor?.id,
    messages: [
      ...c.messages,
      {
        id: `${id}-m${c.messages.length}`,
        from: "staff",
        authorName: actor ? `${actor.firstName} ${actor.lastName}` : "Support",
        body: body.trim(),
        at: new Date().toISOString(),
      },
    ],
  }));
}

export async function updateStatus(
  id: string,
  status: ComplaintStatus,
): Promise<Complaint> {
  await delay();
  const result = patchComplaint(id, (c) => ({ ...c, status }));
  if (status === "resolved") {
    recordActivity("complaints", `Resolved complaint “${result.subject}”`);
  } else {
    recordActivity(
      "complaints",
      `Marked complaint “${result.subject}” as ${STATUS_LABELS[status].toLowerCase()}`,
    );
  }
  return result;
}

export async function reassignComplaint(
  id: string,
  assignedToId: string,
): Promise<Complaint> {
  await delay();
  const result = patchComplaint(id, (c) => ({ ...c, assignedToId }));
  recordActivity("complaints", `Reassigned complaint “${result.subject}”`);
  return result;
}
