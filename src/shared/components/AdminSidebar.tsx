import { useLocation } from "react-router-dom";
import akwaIbomLogo from "@/assets/akwa-ibom-logo-main.png";
import ariseLogo from "@/assets/arise-logo-main.png";
import mbopoLogo from "@/assets/mbopo-logo-dark.webp";
import { useAuth } from "@/features/auth";
import { can, ROLE_LABELS } from "@/lib/rbac";
import { NAV_GROUPS, matchNavItem } from "./navigation";
import {
  SidebarFrame,
  SidebarOverlay,
  SidebarBrand,
  GovLogoRow,
  GovLogoImage,
  SidebarLogo,
  SectionLabel,
  NavList,
  NavItem,
  SidebarFooter,
  SidebarFooterText,
} from "./DashboardSidebar.styles";

export interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const { pathname } = useLocation();
  const { role } = useAuth();
  const activeTo = matchNavItem(pathname)?.to;

  // Only groups with at least one item this role may use are rendered.
  const groups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => !i.capability || can(role, i.capability)),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <SidebarOverlay
        $visible={open}
        aria-label="Close menu"
        onClick={onClose}
      />
      <SidebarFrame $open={open}>
        <SidebarBrand to="/dashboard" onClick={onClose}>
          <GovLogoRow>
            <GovLogoImage src={akwaIbomLogo} alt="Akwa Ibom State Government" />
            <GovLogoImage src={ariseLogo} alt="ARISE Akwa Ibom" />
          </GovLogoRow>
          <SidebarLogo src={mbopoLogo} alt="Mbopo Akwa Ibom" />
        </SidebarBrand>

        {groups.map((group) => (
          <div key={group.label}>
            <SectionLabel>{group.label}</SectionLabel>
            <NavList>
              {group.items.map(({ to, label, icon: Icon }) => (
                <NavItem
                  key={to}
                  to={to}
                  $active={activeTo === to}
                  onClick={onClose}
                >
                  <Icon size={18} />
                  {label}
                </NavItem>
              ))}
            </NavList>
          </div>
        ))}

        <SidebarFooter>
          <SidebarFooterText>
            Signed in as {role ? ROLE_LABELS[role] : "—"}
          </SidebarFooterText>
        </SidebarFooter>
      </SidebarFrame>
    </>
  );
}
