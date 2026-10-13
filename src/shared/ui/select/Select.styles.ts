import styled, { keyframes } from "styled-components";
import * as SelectPrimitive from "@radix-ui/react-select";

export const StyledTrigger = styled(SelectPrimitive.Trigger)<{
  $invalid?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 2.75rem;
  gap: 0.5rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid
    ${({ theme, $invalid }) => ($invalid ? theme.colors.destructive.DEFAULT : theme.colors.input)};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.foreground};
  padding: 0 0.875rem;
  font-size: 0.9375rem;
  font-family: inherit;
  cursor: pointer;
  transition:
    border-color ${({ theme }) => theme.transitions.fast},
    box-shadow ${({ theme }) => theme.transitions.fast};

  &[data-placeholder] {
    color: ${({ theme }) => theme.colors.muted.foreground};
  }

  &:focus-visible {
    outline: none;
    border-color: ${({ theme }) => theme.colors.ring};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.alpha(theme.colors.ring, 0.15)};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  svg {
    flex-shrink: 0;
    opacity: 0.6;
  }
`;

const contentIn = keyframes`
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const StyledContent = styled(SelectPrimitive.Content)`
  position: relative;
  z-index: ${({ theme }) => theme.zIndex.modal};
  max-height: 18rem;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.popover};
  color: ${({ theme }) => theme.colors.popoverForeground};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  animation: ${contentIn} 150ms ease-out;
`;

export const StyledViewport = styled(SelectPrimitive.Viewport)`
  padding: 0.25rem;
`;

export const StyledItem = styled(SelectPrimitive.Item)`
  position: relative;
  display: flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 0.5rem 0.75rem 0.5rem 2rem;
  font-size: 0.9375rem;
  cursor: pointer;
  user-select: none;
  outline: none;

  &[data-highlighted] {
    background: ${({ theme }) => theme.colors.accent.DEFAULT};
    color: ${({ theme }) => theme.colors.accent.foreground};
  }

  &[data-disabled] {
    pointer-events: none;
    opacity: 0.5;
  }
`;

export const StyledItemIndicator = styled(SelectPrimitive.ItemIndicator)`
  position: absolute;
  left: 0.6rem;
  display: inline-flex;
  align-items: center;
`;

export const StyledLabel = styled(SelectPrimitive.Label)`
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.muted.foreground};
`;

export const StyledSeparator = styled(SelectPrimitive.Separator)`
  height: 1px;
  margin: 0.25rem 0;
  background: ${({ theme }) => theme.colors.border};
`;

export const StyledScrollButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0;
  cursor: default;
`;
