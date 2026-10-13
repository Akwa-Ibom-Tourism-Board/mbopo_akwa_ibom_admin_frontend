import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "@/features/auth";
import { DashboardPage } from "@/features/dashboard";
import { AdminShell } from "@/shared/components";
import { NotFoundPage } from "./NotFoundPage";
import { PlaceholderPage } from "./PlaceholderPage";
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
            <Route
              path="/candidates"
              element={<PlaceholderPage title="Candidates" />}
            />
            <Route
              path="/candidates/:id"
              element={<PlaceholderPage title="Candidate" />}
            />
          </Route>

          <Route element={<RoleGuard capability="judging.access" />}>
            <Route
              path="/judging"
              element={<PlaceholderPage title="Judging Queue" />}
            />
            <Route
              path="/judging/:candidateId/score"
              element={<PlaceholderPage title="Score Candidate" />}
            />
          </Route>
          <Route element={<RoleGuard capability="judging.leaderboard" />}>
            <Route
              path="/judging/leaderboard"
              element={<PlaceholderPage title="Leaderboard" />}
            />
          </Route>

          <Route element={<RoleGuard capability="voting.pricing" />}>
            <Route
              path="/voting/pricing"
              element={<PlaceholderPage title="Vote Pricing" />}
            />
          </Route>
          <Route element={<RoleGuard capability="voting.news" />}>
            <Route
              path="/voting/picture-news"
              element={<PlaceholderPage title="Picture News" />}
            />
          </Route>
          <Route element={<RoleGuard capability="voting.sponsors" />}>
            <Route
              path="/voting/sponsors"
              element={<PlaceholderPage title="Sponsors" />}
            />
          </Route>

          <Route element={<RoleGuard capability="users.manage" />}>
            <Route path="/users" element={<PlaceholderPage title="Users" />} />
          </Route>

          <Route element={<RoleGuard capability="complaints.view" />}>
            <Route
              path="/complaints"
              element={<PlaceholderPage title="Complaints" />}
            />
            <Route
              path="/complaints/:id"
              element={<PlaceholderPage title="Complaint" />}
            />
          </Route>

          <Route element={<RoleGuard capability="activity.view" />}>
            <Route
              path="/activity-log"
              element={<PlaceholderPage title="Activity Log" />}
            />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
