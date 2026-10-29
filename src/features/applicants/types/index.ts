// Mirrors the backend's serializeApplicant() / buildRegistrationProgress()
// (admin/helpers/applicant.helpers.ts, applicant-progress.helpers.ts).
export type ApplicationStatus = "draft" | "submitted";
export type ApplicantFilterStatus = "not_started" | "in_progress" | "submitted";

export interface RegistrationStep {
  step: number;
  label: string;
  completed: boolean;
  missingFields: string[];
}

export interface RegistrationProgress {
  identityVerified: boolean;
  applicationStarted: boolean;
  applicationStatus: ApplicationStatus | null;
  steps: RegistrationStep[];
  completedSteps: number;
  totalSteps: number;
  currentStepLabel: string | null;
}

export interface Applicant {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phoneNumber: string | null;
  emailVerified: boolean;
  identityVerified: boolean;
  active: boolean;
  createdAt: string;
  applicationId: string | null;
  progress: RegistrationProgress;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
