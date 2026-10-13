export type ComplaintStatus = "open" | "in_progress" | "resolved";
export type ComplaintSource = "contestant" | "public";

export interface ComplaintMessage {
  id: string;
  from: "complainant" | "staff";
  authorName: string;
  body: string;
  at: string; // ISO
}

export interface Complaint {
  id: string;
  subject: string;
  source: ComplaintSource;
  complainantName: string;
  complainantEmail: string;
  status: ComplaintStatus;
  assignedToId?: string; // a Customer Service user
  createdAt: string;
  updatedAt: string;
  messages: ComplaintMessage[];
}

export const STATUS_LABELS: Record<ComplaintStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
};

export const SOURCE_LABELS: Record<ComplaintSource, string> = {
  contestant: "Contestant",
  public: "General public",
};
