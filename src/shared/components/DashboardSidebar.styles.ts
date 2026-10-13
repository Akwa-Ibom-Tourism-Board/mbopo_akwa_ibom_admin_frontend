import styled from "styled-components";
import { Link } from "react-router-dom";
import { media } from "@/theme";

export const SidebarFrame = styled.aside<{ $open: boolean }>`
  position: fixed;
  z-index: ${({ theme }) => theme.zIndex.modal};
  top: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  width: 264px;
  height: 100vh;
  padding: 22px 14px;
  background: ${({ theme }) => theme.colors.sectionDark};
  color: ${({ theme }) => theme.colors.white};
  overflow-y: auto;
  transform: translateX(${({ $open }) => ($open ? "0" : "-100%")});
  transition: transform ${({ theme }) => theme.transitions.base};

  /* Stays fixed to the viewport regardless of how tall the main content
     column gets — a flex sibling with "sticky" here would stretch to match
     that height (its containing block), which combined with top+bottom
     anchors made it visibly drift as the form scrolled. */
  ${media.lg} {
    transform: none;
  }
`;

export const SidebarOverlay = styled.button<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  /* Must sit above everything else in the shell — including the topbar,
     which shares the "sticky" z-index layer — so the whole page behind
     it is covered, not just the content below the topbar. */
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: ${({ $visible }) => ($visible ? "block" : "none")};
  border: none;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  cursor: pointer;

  ${media.lg} {
    display: none;
  }
`;

export const SidebarBrand = styled(Link)`
  display: block;
  padding: 4px 8px 18px;
  margin-bottom: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

export const GovLogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

export const GovLogoImage = styled.img`
  height: 26px;
  width: auto;
  object-fit: contain;
`;

export const SidebarLogo = styled.img`
  height: 40px;
  width: auto;
  object-fit: contain;
`;

export const SectionLabel = styled.p`
  margin: 4px 8px 10px;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
`;

export const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const NavItem = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme, $active }) => ($active ? theme.colors.white : "rgba(255, 255, 255, 0.72)")};
  background: ${({ theme, $active }) => ($active ? theme.colors.secondary.DEFAULT : "transparent")};
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme, $active }) => ($active ? theme.colors.secondary.DEFAULT : "rgba(255, 255, 255, 0.08)")};
    color: ${({ theme }) => theme.colors.white};
  }

  svg {
    flex-shrink: 0;
  }
`;

export const SidebarFooter = styled.div`
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

export const FooterLinkRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  padding: 0 8px 10px;
`;

export const FooterLink = styled(Link)`
  font-size: 0.6875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.55);
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.white};
  }
`;

export const SidebarFooterText = styled.p`
  margin: 0;
  padding: 0 8px;
  font-size: 0.6875rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.4);
`;
