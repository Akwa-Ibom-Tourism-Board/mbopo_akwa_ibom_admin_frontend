import styled from "styled-components";
import { media } from "@/theme";

// Sticky frame for the whole topbar stack (disclaimer strip + topbar
// row) — the strip lives inside this, as a normal-flow first child, the
// same "nest, don't independently stick" approach Navbar uses, so the
// two never need hardcoded height coordination to stack correctly.
export const TopbarFrame = styled.header`
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.sticky};
  background: ${({ theme }) => theme.alpha(theme.colors.background, 0.92)};
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const TopbarRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;

  ${media.lg} {
    padding: 18px 32px;
  }
`;

export const MenuToggle = styled.button`
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.foreground};
  cursor: pointer;

  ${media.lg} {
    display: none;
  }
`;

// flex: 1 alone doesn't let a flex item shrink below its own content's
// width (min-width defaults to auto) — on a narrow phone that forced
// "Mbopo Registration" to wrap to two lines rather than shrink, bloating
// the header's height. min-width: 0 lets it actually shrink; the
// ellipsis rules are the safety net for whatever's still too long once it
// does. Font size scales down on small screens instead of staying fixed
// at the desktop size.
export const Title = styled.h1`
  flex: 1;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(1rem, 0.9rem + 1vw, 1.25rem);
  font-weight: 600;
`;

export const RightCluster = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const ProfileTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px 4px 4px;
  border: none;
  border-radius: ${({ theme }) => theme.radii.full};
  background: transparent;
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.muted.DEFAULT};
  }

  svg {
    color: ${({ theme }) => theme.colors.muted.foreground};
  }
`;

export const UserMeta = styled.div`
  display: none;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.3;

  ${media.sm} {
    display: flex;
  }
`;

export const UserName = styled.span`
  font-size: 0.8125rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.foreground};
`;

export const UserReference = styled.span`
  display: none;
  font-size: 0.6875rem;
  color: ${({ theme }) => theme.colors.muted.foreground};

  ${media.lg} {
    display: block;
  }
`;

export const DropdownGreeting = styled.p`
  margin: 0;
  padding: 12px 14px 8px;
  font-size: 0.9375rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.foreground};
`;
