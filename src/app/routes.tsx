import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "@/features/auth";
import { CandidateDetailPage, CandidatesPage } from "@/features/candidates";
import { ActivityLogPage } from "@/features/activity-log";
import { ComplaintDetailPage, ComplaintsPage } from "@/features/complaints";
import { DashboardPage } from "@/features/dashboard";
import { UsersPage } from "@/features/users";
import {
  PictureNewsAdminPage,
  PricingPage,
  SponsorsAdminPage,
} from "@/features/voting-content";
import { CandidateScoringPage, LeaderboardPage } from "@/features/judging";
import { StagePage } from "@/features/stages";
import { JudgingRedirect } from "./JudgingRedirect";
import { AdminShell } from "@/shared/components";
import { NotFoundPage } from "./NotFoundPage";
import { RequireAuth, RoleGuard } from "./RoleGuard";

// Every protected route sits under RequireAuth (signed in) and, where the
// route table in BUILD_ME.md §10 restricts it, a RoleGuard capability check.
// Front-end only — the backend must enforce the same rules itself.
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<RequireAuth />}>
        <Route element={<AdminShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route element={<RoleGuard capability="candidates.view" />}>
            <Route path="/candidates" element={<CandidatesPage />} />
            <Route path="/candidates/:id" element={<CandidateDetailPage />} />
          </Route>

          <Route element={<RoleGuard capability="candidates.view" />}>
            <Route path="/stages/:phaseId" element={<StagePage />} />
          </Route>

          <Route element={<RoleGuard capability="judging.access" />}>
            <Route path="/judging" element={<JudgingRedirect />} />
            <Route
              path="/judging/:candidateId/score"
              element={<CandidateScoringPage />}
            />
          </Route>
          <Route element={<RoleGuard capability="judging.leaderboard" />}>
            <Route path="/judging/leaderboard" element={<LeaderboardPage />} />
          </Route>

          <Route element={<RoleGuard capability="voting.pricing" />}>
            <Route path="/voting/pricing" element={<PricingPage />} />
          </Route>
          <Route element={<RoleGuard capability="voting.news" />}>
            <Route
              path="/voting/picture-news"
              element={<PictureNewsAdminPage />}
            />
          </Route>
          <Route element={<RoleGuard capability="voting.sponsors" />}>
            <Route path="/voting/sponsors" element={<SponsorsAdminPage />} />
          </Route>

          <Route element={<RoleGuard capability="users.manage" />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>

          <Route element={<RoleGuard capability="complaints.view" />}>
            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
          </Route>

          <Route element={<RoleGuard capability="activity.view" />}>
            <Route path="/activity-log" element={<ActivityLogPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
