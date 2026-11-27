import { request } from "@/lib/http";

export type RegistrationStatus = "open" | "new_intake_closed" | "closed";

export interface RegistrationSettingInfo {
  status: RegistrationStatus;
  updatedAt: string | null;
  updatedBy: string | null;
}

export async function getRegistrationSetting(): Promise<RegistrationSettingInfo> {
  return request("/admin/settings/registration");
}

export async function updateRegistrationSetting(
  status: RegistrationStatus,
): Promise<{ status: RegistrationStatus }> {
  return request("/admin/settings/registration", {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
