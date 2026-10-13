import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/features/auth";
import { can, type Capability } from "@/lib/rbac";
import { Button } from "@/shared/ui";
import { EmptyState } from "@/shared/components";

// Frontend-only gate (see the warning in lib/rbac.ts). The protected
// children are never mounted unless the check passes, so nothing under a
// guarded route fetches data for a role that isn't allowed — but the real
// enforcement still has to happen server-side.

// Requires a signed-in user; renders the nested routes.
export function RequireAuth() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

// Requires a capability on top of being signed in; renders the nested routes.
export function RoleGuard({ capability }: { capability: Capability }) {
  const { role } = useAuth();
  if (!can(role, capability)) return <AccessDenied />;
  return <Outlet />;
}

function AccessDenied() {
  return (
    <EmptyState>
      <ShieldAlert size={32} />
      <h3>You don't have access to this page</h3>
      <p>Your role doesn't include this area of the portal.</p>
      <Button asChild>
        <Link to="/dashboard">Back to dashboard</Link>
      </Button>
    </EmptyState>
  );
}
