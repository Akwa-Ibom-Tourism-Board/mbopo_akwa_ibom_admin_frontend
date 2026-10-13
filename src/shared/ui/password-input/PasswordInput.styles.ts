import styled from "styled-components";
import { Input } from "../input";

export const Wrapper = styled.div`
  position: relative;
  width: 100%;
`;

// Extends Input (see Switch.styles.ts's styled(SwitchPrimitive.Root) or
// Navbar.styles.ts's styled(Link) for the same wrap-and-extend pattern
// already used elsewhere in this codebase) purely to make room on the
// right for the show/hide toggle button.
export const StyledPasswordInput = styled(Input)`
  padding-right: 2.5rem;
`;

export const ToggleButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.muted.foreground};
  cursor: pointer;
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.foreground};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.ring};
    outline-offset: -2px;
    border-radius: ${({ theme }) => theme.radii.md};
  }
`;
