import styled, { keyframes } from "styled-components";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

const contentIn = keyframes`
  from { opacity: 0; transform: translateY(-6px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

export const StyledContent = styled(DropdownMenuPrimitive.Content)`
  z-index: ${({ theme }) => theme.zIndex.modal};
  min-width: 220px;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.popover};
  color: ${({ theme }) => theme.colors.popoverForeground};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  animation: ${contentIn} 150ms ease-out;
`;

export const StyledLabel = styled(DropdownMenuPrimitive.Label)`
  padding: 12px 14px 4px;
  font-size: 0.9375rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.foreground};
`;

export const StyledItem = styled(DropdownMenuPrimitive.Item)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.foreground};
  cursor: pointer;
  user-select: none;
  outline: none;
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &[data-highlighted] {
    background: ${({ theme }) => theme.colors.muted.DEFAULT};
  }

  &[data-disabled] {
    pointer-events: none;
    opacity: 0.5;
  }

  svg {
    flex-shrink: 0;
    color: ${({ theme }) => theme.colors.muted.foreground};
  }
`;

export const StyledDestructiveItem = styled(StyledItem)`
  color: ${({ theme }) => theme.colors.destructive.DEFAULT};

  &[data-highlighted] {
    background: ${({ theme }) => theme.alpha(theme.colors.destructive.DEFAULT, 0.1)};
  }

  svg {
    color: ${({ theme }) => theme.colors.destructive.DEFAULT};
  }
`;

export const StyledSeparator = styled(DropdownMenuPrimitive.Separator)`
  height: 1px;
  margin: 4px 0;
  background: ${({ theme }) => theme.colors.border};
`;
