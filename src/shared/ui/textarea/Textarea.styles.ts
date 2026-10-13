import styled from "styled-components";

export const StyledTextarea = styled.textarea<{ $invalid?: boolean }>`
  display: flex;
  width: 100%;
  min-height: 7rem;
  resize: vertical;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid
    ${({ theme, $invalid }) => ($invalid ? theme.colors.destructive.DEFAULT : theme.colors.input)};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.foreground};
  padding: 0.75rem 0.875rem;
  font-size: 0.9375rem;
  font-family: inherit;
  line-height: 1.5;
  transition:
    border-color ${({ theme }) => theme.transitions.fast},
    box-shadow ${({ theme }) => theme.transitions.fast};

  &::placeholder {
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
`;
