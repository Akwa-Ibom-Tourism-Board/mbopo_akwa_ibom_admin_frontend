import styled from "styled-components";
import * as SwitchPrimitive from "@radix-ui/react-switch";

export const StyledRoot = styled(SwitchPrimitive.Root)`
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  width: 2.75rem;
  height: 1.5rem;
  border-radius: ${({ theme }) => theme.radii.full};
  border: none;
  background: ${({ theme }) => theme.colors.muted.DEFAULT};
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &[data-state="checked"] {
    background: ${({ theme }) => theme.colors.primary.DEFAULT};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.ring};
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const StyledThumb = styled(SwitchPrimitive.Thumb)`
  display: block;
  width: 1.125rem;
  height: 1.125rem;
  margin-left: 0.1875rem;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: transform ${({ theme }) => theme.transitions.fast};
  transform: translateX(0);
  will-change: transform;

  &[data-state="checked"] {
    transform: translateX(1.1875rem);
  }
`;
