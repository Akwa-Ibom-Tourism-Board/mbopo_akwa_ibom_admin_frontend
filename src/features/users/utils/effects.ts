import type { AdminUser } from "../types";

// What deactivating or reactivating these accounts does beyond signing them
// out — only judges and the Head Judge have a knock-on effect (their scores).
export function judgeEffectNote(users: AdminUser[], active: boolean) {
  const judges = users.filter(
    (u) => u.role === "judge" || u.role === "head_judge",
  );
  if (!judges.length) return undefined;
  if (active) {
    return "Their scores count again in every stage that isn't closed yet.";
  }
  const head = judges.some((u) => u.role === "head_judge")
    ? " With no active Head Judge, results can only be submitted by an administrator."
    : "";
  return `Their scores stop counting in every stage that isn't closed yet — totals, rankings and the "everyone has voted" check. Closed stages are unaffected.${head}`;
}
