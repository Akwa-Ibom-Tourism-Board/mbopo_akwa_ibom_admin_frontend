import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";
import akwaIbomLogo from "@/assets/akwa-ibom-logo-main.png";
import ariseLogo from "@/assets/arise-logo-main.png";
import mbopoLogo from "@/assets/mbopo-logo-dark.webp";
import { useAuth } from "@/features/auth";
import { usePhaseStates } from "@/features/stages/api/hooks";
import { can, ROLE_LABELS } from "@/lib/rbac";
import { NAV_GROUPS, matchNavItem, type NavItemConfig } from "./navigation";
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
  NavParent,
  SubNavList,
  SubNavItem,
  OpenPill,
  SidebarFooter,
  SidebarFooterText,
} from "./DashboardSidebar.styles";

export interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

function useOpenPhases() {
  // Only roles that can see candidates see stage items, and the stage states
  // carry no scores, so this is safe for every signed-in role that gets there.
  const { data } = usePhaseStates();
  return new Set(
    data?.filter((p) => p.status === "open").map((p) => p.phaseId),
  );
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const { pathname } = useLocation();
  const { role } = useAuth();
  const activeTo = matchNavItem(pathname)?.to;
  const openPhases = useOpenPhases();

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
          <div key={group.label} style={{ marginTop: 12 }}>
            <SectionLabel>{group.label}</SectionLabel>
            <NavList>
              {group.items.map((item) =>
                item.children ? (
                  <NavBranch
                    key={item.label}
                    item={item}
                    pathname={pathname}
                    activeTo={activeTo}
                    openPhases={openPhases}
                    onClose={onClose}
                  />
                ) : (
                  <NavLeaf
                    key={item.to}
                    item={item}
                    active={activeTo === item.to}
                    open={!!item.phaseId && openPhases.has(item.phaseId)}
                    onClose={onClose}
                  />
                ),
              )}
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

function NavLeaf({
  item,
  active,
  open,
  onClose,
  sub = false,
}: {
  item: NavItemConfig;
  active: boolean;
  open: boolean;
  onClose: () => void;
  sub?: boolean;
}) {
  const Item = sub ? SubNavItem : NavItem;
  const Icon = item.icon;
  return (
    <Item to={item.to!} $active={active} onClick={onClose}>
      {Icon && <Icon size={18} />}
      {item.label}
      {open && <OpenPill>Open</OpenPill>}
    </Item>
  );
}

// A parent entry with a sub-menu. Starts expanded when one of its pages is the
// current page, and can be toggled otherwise.
function NavBranch({
  item,
  pathname,
  activeTo,
  openPhases,
  onClose,
}: {
  item: NavItemConfig;
  pathname: string;
  activeTo: string | undefined;
  openPhases: Set<string>;
  onClose: () => void;
}) {
  const children = item.children ?? [];
  const inside = children.some((c) => pathname.startsWith(c.to!));
  const [expanded, setExpanded] = useState(inside);
  const show = expanded || inside;
  const Icon = item.icon;
  const anyOpen = children.some((c) => c.phaseId && openPhases.has(c.phaseId));

  return (
    <div>
      <NavParent
        type="button"
        $active={inside}
        aria-expanded={show}
        onClick={() => setExpanded(!show)}
      >
        {Icon && <Icon size={18} />}
        {item.label}
        {anyOpen && !show && <OpenPill>Open</OpenPill>}
        <ChevronDown
          className="chevron"
          size={16}
          style={{ transform: show ? "rotate(180deg)" : undefined }}
        />
      </NavParent>
      {show && (
        <SubNavList>
          {children.map((c) => (
            <NavLeaf
              key={c.to}
              sub
              item={c}
              active={activeTo === c.to}
              open={!!c.phaseId && openPhases.has(c.phaseId)}
              onClose={onClose}
            />
          ))}
        </SubNavList>
      )}
    </div>
  );
}
