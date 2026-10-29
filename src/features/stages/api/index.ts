import { request } from "@/lib/http";
import type { PhaseId } from "@/lib/phases";
import type { PhaseState } from "../types";

export async function getPhaseStates(): Promise<PhaseState[]> {
  return request<PhaseState[]>("/admin/stages");
}

export async function openPhase(id: PhaseId): Promise<{ moved: number }> {
  return request<{ moved: number }>(`/admin/stages/${id}/open`, { method: "POST" });
}
