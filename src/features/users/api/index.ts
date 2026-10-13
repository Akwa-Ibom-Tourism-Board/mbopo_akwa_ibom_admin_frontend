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
    throw new Error(`You can't manage ${ROLE_LABELS[target]} accounts.`);
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

export async function getUsers(): Promise<AdminUser[]> {
  await delay();
  return users.map((u) => ({ ...u }));
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
