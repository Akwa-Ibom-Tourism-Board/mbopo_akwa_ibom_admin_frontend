import { request } from "@/lib/http";
import type { ActivityEntry } from "../types";

// Super Admin / Admin only (gated at the route via "activity.view"); a
// Super Admin's own entries are already left out for an Admin viewer by
// the backend (admin/helpers/activity.helpers.ts's visibleToViewer).
export async function getActivity(): Promise<ActivityEntry[]> {
  return request<ActivityEntry[]>("/admin/activity");
}
