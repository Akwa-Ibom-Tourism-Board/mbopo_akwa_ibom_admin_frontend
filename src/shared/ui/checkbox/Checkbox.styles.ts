import styled from "styled-components";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

export const StyledCheckbox = styled(CheckboxPrimitive.Root)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.input};
  background: ${({ theme }) => theme.colors.background};
  cursor: pointer;
  transition:
    background-color ${({ theme }) => theme.transitions.fast},
    border-color ${({ theme }) => theme.transitions.fast};

  &[data-state="checked"] {
    background: ${({ theme }) => theme.colors.primary.DEFAULT};
    border-color: ${({ theme }) => theme.colors.primary.DEFAULT};
    color: ${({ theme }) => theme.colors.primary.foreground};
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

export const StyledIndicator = styled(CheckboxPrimitive.Indicator)`
  display: flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
`;
