import { request } from "@/lib/http";
import type { Applicant, ApplicantFilterStatus, PageMeta } from "../types";

export interface ApplicantListQuery {
  search?: string;
  status?: ApplicantFilterStatus;
  page?: number;
  limit?: number;
}

export async function getApplicants(
  query: ApplicantListQuery = {},
): Promise<{ applicants: Applicant[]; meta: PageMeta }> {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return request(`/admin/applicants${qs ? `?${qs}` : ""}`);
}

export async function getApplicant(id: string): Promise<Applicant> {
  return request<Applicant>(`/admin/applicants/${id}`);
}

export async function setApplicantActive(id: string, active: boolean): Promise<Applicant> {
  return request<Applicant>(`/admin/applicants/${id}/active`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}

export async function deleteApplicant(id: string): Promise<void> {
  await request(`/admin/applicants/${id}`, { method: "DELETE" });
}
