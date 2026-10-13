import styled, { keyframes } from "styled-components";

export const StyledGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
`;

const caretBlink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

export const StyledSlot = styled.div<{ $active: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 3.25rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid
    ${({ theme, $active }) => ($active ? theme.colors.ring : theme.colors.input)};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 1.25rem;
  font-weight: 600;
  transition:
    border-color ${({ theme }) => theme.transitions.fast},
    box-shadow ${({ theme }) => theme.transitions.fast};
  ${({ theme, $active }) => $active && `box-shadow: 0 0 0 3px ${theme.alpha(theme.colors.ring, 0.15)};`}
`;

export const StyledCaret = styled.div`
  position: absolute;
  pointer-events: none;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: "";
    width: 1px;
    height: 1.375rem;
    background: ${({ theme }) => theme.colors.foreground};
    animation: ${caretBlink} 1s step-end infinite;
  }
`;
