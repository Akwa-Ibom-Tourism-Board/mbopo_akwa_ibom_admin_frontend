import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { matchNavItem } from "./navigation";
import { ShellFrame, ContentPane, ContentBody } from "./DashboardShell.styles";

// Sidebar + sticky topbar + content pane, adapted from the applicant
// platform's DashboardShell. Rendered as a layout route.
export function AdminShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const title = (() => {
    const item = matchNavItem(pathname);
    return item?.title ?? item?.label ?? "Mbopo Admin";
  })();

  return (
    <ShellFrame>
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <ContentPane>
        <AdminTopbar title={title} onOpenSidebar={() => setSidebarOpen(true)} />
        <ContentBody>
          <Outlet />
        </ContentBody>
      </ContentPane>
    </ShellFrame>
  );
}
