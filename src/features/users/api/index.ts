import { recordActivity } from "@/features/activity-log/api";
import { readSessionUser } from "@/features/auth/session";
import { ROLE_LABELS, canAssignRole } from "@/lib/rbac";
import { MOCK_USERS } from "../data/mock-users";
import type { AdminUser, NewUserInput, UserUpdate } from "../types";

// Dummy data layer. The rules below mirror what the real backend must enforce
// on its own: nobody can create or promote anyone to Super Admin, and a user
// can only manage roles their own role may assign (lib/rbac.ts).
const delay = (ms = 150) => new Promise((r) => setTimeout(r, ms));

let users: AdminUser[] = MOCK_USERS.map((u) => ({ ...u }));

const article = (word: string) => (/^[aeiou]/i.test(word) ? "an" : "a");

const fullName = (u: Pick<AdminUser, "firstName" | "lastName">) =>
  `${u.firstName} ${u.lastName}`;

function assertCanManage(target: AdminUser["role"]) {
  const actor = readSessionUser();
  if (!canAssignRole(actor?.role, target)) {
    throw new Error("You can't manage that account.");
  }
}

// There is one Head Judge at a time: the person who finalizes the scores and
// closes each stage. Creating, promoting or reactivating a second active one
// is refused until the current Head Judge is deactivated or changed.
function assertSingleHeadJudge(candidateId: string | null) {
  const other = users.find(
    (u) => u.role === "head_judge" && u.active && u.id !== candidateId,
  );
  if (other) {
    throw new Error(
      `${fullName(other)} is already the Head Judge. Deactivate or change them first.`,
    );
  }
}

// Who the signed-in person is allowed to know about. Only the Super Admin
// ever sees Super Admin accounts; for everyone else they simply aren't there.
export async function getUsers(): Promise<AdminUser[]> {
  await delay();
  const viewer = readSessionUser();
  return users
    .filter((u) => u.role !== "super_admin" || viewer?.role === "super_admin")
    .map((u) => ({ ...u }));
}

export async function createUser(input: NewUserInput): Promise<AdminUser> {
  await delay();
  assertCanManage(input.role);
  if (input.role === "head_judge") assertSingleHeadJudge(null);
  if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("A user with that email already exists.");
  }
  const user: AdminUser = {
    ...input,
    id: `u-${Math.random().toString(36).slice(2, 9)}`,
    active: true,
    createdAt: new Date().toISOString(),
    passwordChangedAt: new Date().toISOString(),
  };
  users = [...users, user];
  recordActivity(
    "users",
    `Created ${article(ROLE_LABELS[user.role])} ${ROLE_LABELS[user.role]} account for ${fullName(user)}`,
  );
  return { ...user };
}

export async function updateUser(
  id: string,
  patch: UserUpdate,
): Promise<AdminUser> {
  await delay();
  const current = users.find((u) => u.id === id);
  if (!current) throw new Error("User not found.");
  assertCanManage(current.role);
  if (patch.role) assertCanManage(patch.role);
  if (patch.role === "head_judge" && current.active) assertSingleHeadJudge(id);
  if (
    patch.email &&
    users.some(
      (u) =>
        u.id !== id && u.email.toLowerCase() === patch.email!.toLowerCase(),
    )
  ) {
    throw new Error("A user with that email already exists.");
  }
  const next = { ...current, ...patch };
  users = users.map((u) => (u.id === id ? next : u));
  recordActivity("users", `Updated the account of ${fullName(next)}`);
  return { ...next };
}

export async function setUserActive(
  id: string,
  active: boolean,
): Promise<AdminUser> {
  await delay();
  const current = users.find((u) => u.id === id);
  if (!current) throw new Error("User not found.");
  assertCanManage(current.role);
  if (active && current.role === "head_judge") assertSingleHeadJudge(id);
  if (readSessionUser()?.id === id)
    throw new Error("You can't deactivate your own account.");
  const next = { ...current, active };
  users = users.map((u) => (u.id === id ? next : u));
  recordActivity(
    "users",
    `${active ? "Reactivated" : "Deactivated"} the ${ROLE_LABELS[next.role]} account of ${fullName(next)}`,
  );
  return { ...next };
}

// Password recovery. Nobody can read a password, so "lost login" is solved by
// issuing a fresh temporary one: it is generated here, emailed to the person's
// address and kept only in scrambled form (in this dummy build it is simply
// not kept — the real backend generates, hashes and emails it). The caller
// never receives the password.
export async function resetPassword(id: string): Promise<{ email: string }> {
  await delay(300);
  const current = users.find((u) => u.id === id);
  if (!current) throw new Error("User not found.");
  assertCanManage(current.role);
  if (!current.active)
    throw new Error("Reactivate this account before resetting its password.");
  users = users.map((u) =>
    u.id === id ? { ...u, passwordChangedAt: new Date().toISOString() } : u,
  );
  recordActivity(
    "users",
    `Reset the password of ${fullName(current)} — a new temporary password was emailed to them`,
  );
  return { email: current.email };
}

export interface BulkResult {
  created: AdminUser[];
  // Index into the submitted list, so the form can mark the right rows.
  failed: { index: number; error: string }[];
}

// Creates several accounts in one go. Each row is checked on its own with the
// same rules as createUser (assignable role, unique email — including against
// earlier rows in this batch — and the single Head Judge), so one bad row
// doesn't stop the others. One activity entry summarises the batch.
export async function createUsers(inputs: NewUserInput[]): Promise<BulkResult> {
  await delay(400);
  const created: AdminUser[] = [];
  const failed: BulkResult["failed"] = [];
  inputs.forEach((input, index) => {
    try {
      assertCanManage(input.role);
      if (input.role === "head_judge") assertSingleHeadJudge(null);
      if (
        users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())
      ) {
        throw new Error("A user with that email already exists.");
      }
      const user: AdminUser = {
        ...input,
        id: `u-${Math.random().toString(36).slice(2, 9)}`,
        active: true,
        createdAt: new Date().toISOString(),
        passwordChangedAt: new Date().toISOString(),
      };
      users = [...users, user];
      created.push({ ...user });
    } catch (e) {
      failed.push({
        index,
        error: e instanceof Error ? e.message : "Couldn't add this user.",
      });
    }
  });
  if (created.length) {
    const byRole = new Map<string, number>();
    created.forEach((u) =>
      byRole.set(
        ROLE_LABELS[u.role],
        (byRole.get(ROLE_LABELS[u.role]) ?? 0) + 1,
      ),
    );
    recordActivity(
      "users",
      `Added ${created.length} staff account${created.length === 1 ? "" : "s"} in bulk (${[...byRole].map(([r, n]) => `${n} ${r}`).join(", ")})`,
    );
  }
  return { created, failed };
}
