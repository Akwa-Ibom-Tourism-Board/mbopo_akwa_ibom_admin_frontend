import type { ActivityEntry } from "../types";

// Seed history. Judging entries record THAT a decision was made and by whom —
// never the scores behind it.
export const MOCK_ACTIVITY: ActivityEntry[] = [
  {
    id: "act-1",
    at: "2026-10-12T15:20:00.000Z",
    actorName: "Idara Okon",
    actorRole: "judge",
    category: "judging",
    summary: "Advanced 3 candidates (Uyo, Local Government stage)",
  },
  {
    id: "act-2",
    at: "2026-10-12T11:05:00.000Z",
    actorName: "Mfon Bassey",
    actorRole: "media",
    category: "voting",
    summary:
      "Published picture news post “Mbopo Festival returns with a brighter, bolder showcase”",
  },
  {
    id: "act-3",
    at: "2026-10-11T16:40:00.000Z",
    actorName: "Utibe Akpan",
    actorRole: "admin",
    category: "users",
    summary: "Created a Judge account for Dr. Affiong Effiong",
  },
  {
    id: "act-4",
    at: "2026-10-10T09:15:00.000Z",
    actorName: "Ekemini Essien",
    actorRole: "super_admin",
    category: "voting",
    summary: "Updated vote pricing",
  },
  {
    id: "act-5",
    at: "2026-10-09T13:30:00.000Z",
    actorName: "Ekaette Umoh",
    actorRole: "judge",
    category: "judging",
    summary: "Disqualified 1 candidate (Providing false information)",
  },
  {
    id: "act-6",
    at: "2026-10-08T10:00:00.000Z",
    actorName: "Mfon Bassey",
    actorRole: "media",
    category: "candidates",
    summary: "Updated the public profile of Eno Ntia",
  },
  {
    id: "act-7",
    at: "2026-10-07T14:25:00.000Z",
    actorName: "Nsikak Umoh",
    actorRole: "customer_service",
    category: "complaints",
    summary: "Resolved complaint “Payment deducted but votes not credited”",
  },
];
