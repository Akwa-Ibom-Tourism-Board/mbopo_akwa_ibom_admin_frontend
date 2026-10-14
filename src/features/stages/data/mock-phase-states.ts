import { MOCK_CANDIDATES } from "@/features/candidates/data/mock-candidates";
import { PHASES } from "@/lib/phases";
import type { PhaseState } from "../types";

// Seed: Local Government is closed (its 93 selections wait to be moved into
// Senatorial); every later stage is still pending, so an Admin / Super Admin
// can open Senatorial and the rest are empty until their turn.
export const MOCK_PHASE_STATES: PhaseState[] = PHASES.map((p) =>
  p.id === "lga"
    ? {
        phaseId: p.id,
        status: "closed",
        openedAt: "2026-08-03T08:00:00.000Z",
        openedBy: "Utibe Akpan",
        openedByRole: "admin" as const,
        closedAt: "2026-09-18T16:00:00.000Z",
        closedBy: "Mbuk Inyang",
        passedIds: MOCK_CANDIDATES.filter((c) => c.status === "advanced").map(
          (c) => c.id,
        ),
      }
    : { phaseId: p.id, status: "pending" },
);
