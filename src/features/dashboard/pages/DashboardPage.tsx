import { useAuth } from "@/features/auth";
import { AdminDashboard } from "../components/AdminDashboard";
import { CustomerServiceDashboard } from "../components/CustomerServiceDashboard";
import { JudgeDashboard } from "../components/JudgeDashboard";
import { MediaDashboard } from "../components/MediaDashboard";
import { SuperAdminDashboard } from "../components/SuperAdminDashboard";

// Each role gets its own dashboard component — only the signed-in role's
// component is mounted, so nothing for another role renders or fetches.
export function DashboardPage() {
  const { role } = useAuth();
  switch (role) {
    case "super_admin":
      return <SuperAdminDashboard />;
    case "admin":
      return <AdminDashboard />;
    case "media":
      return <MediaDashboard />;
    case "judge":
      return <JudgeDashboard />;
    case "customer_service":
      return <CustomerServiceDashboard />;
    default:
      return null;
  }
}
