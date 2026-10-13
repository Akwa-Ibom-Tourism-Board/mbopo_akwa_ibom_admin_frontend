import styled, { keyframes } from "styled-components";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Command, CommandInput, CommandList, CommandItem } from "cmdk";

export const StyledTrigger = styled.button<{ $invalid?: boolean }>`
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
  text-align: left;
  cursor: pointer;
  transition:
    border-color ${({ theme }) => theme.transitions.fast},
    box-shadow ${({ theme }) => theme.transitions.fast};

  &[data-placeholder="true"] {
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

export const TriggerLabel = styled.span`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const contentIn = keyframes`
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const StyledPopoverContent = styled(PopoverPrimitive.Content)`
  z-index: ${({ theme }) => theme.zIndex.modal};
  width: var(--radix-popover-trigger-width);
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.popover};
  color: ${({ theme }) => theme.colors.popoverForeground};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  animation: ${contentIn} 150ms ease-out;
`;

export const StyledCommand = styled(Command)`
  display: flex;
  flex-direction: column;
`;

export const SearchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0 0.75rem;

  svg {
    flex: 0 0 auto;
    opacity: 0.5;
  }
`;

export const StyledCommandInput = styled(CommandInput)`
  flex: 1;
  height: 2.5rem;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.875rem;
  font-family: inherit;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.muted.foreground};
  }
`;

export const StyledCommandList = styled(CommandList)`
  max-height: 15rem;
  overflow-y: auto;
  padding: 0.25rem;
`;

export const EmptyState = styled.div`
  padding: 0.875rem 0.75rem;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.8125rem;
  text-align: center;
`;

export const StyledCommandItem = styled(CommandItem)`
  position: relative;
  display: flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 0.5rem 0.75rem 0.5rem 2rem;
  font-size: 0.9375rem;
  cursor: pointer;
  user-select: none;
  outline: none;

  &[data-selected="true"] {
    background: ${({ theme }) => theme.colors.accent.DEFAULT};
    color: ${({ theme }) => theme.colors.accent.foreground};
  }
`;

export const ItemCheck = styled.span<{ $visible: boolean }>`
  position: absolute;
  left: 0.6rem;
  display: inline-flex;
  align-items: center;
  visibility: ${({ $visible }) => ($visible ? "visible" : "hidden")};
`;
