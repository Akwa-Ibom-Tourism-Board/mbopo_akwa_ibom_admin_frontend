export type ComplaintStatus = "open" | "in_progress" | "resolved";
export type ComplaintSource = "contestant" | "public";
// Where the complaint itself came in on — the "Ask Me" widget, an email
// sent straight to info@akhtdc.com.ng (picked up by the backend's Zoho
// Mail sync), or started by staff from a participant's own detail page.
export type ComplaintChannel = "widget" | "email" | "admin";

export interface ComplaintAttachment {
  url: string;
  filename: string;
  bytes: number;
}

// Whether a staff reply's notification email actually reached the
// complainant — only ever set on messages with from: "staff".
export type ReplyEmailStatus = "pending" | "sent" | "failed";

export interface ComplaintMessage {
  id: string;
  from: "complainant" | "staff";
  authorName: string;
  body: string;
  at: string; // ISO
  // Populated on the complainant's original widget submission (up to 3
  // files attached at submit time) and on any complainant follow-up email
  // that had image/PDF attachments.
  attachments?: ComplaintAttachment[];
  emailStatus?: ReplyEmailStatus;
  emailError?: string;
}

export interface Complaint {
  id: string;
  subject: string;
  source: ComplaintSource;
  channel: ComplaintChannel;
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

export const CHANNEL_LABELS: Record<ComplaintChannel, string> = {
  widget: "Ask Me widget",
  email: "Email",
  admin: "Started by staff",
};
