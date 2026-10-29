import styled, { keyframes } from "styled-components";

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export const SpinnerRing = styled.span<{ $size: number }>`
  display: inline-block;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border: ${({ $size }) => Math.max(2, Math.round($size / 8))}px solid
    ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary.DEFAULT};
  border-radius: ${({ theme }) => theme.radii.full};
  animation: ${spin} 0.7s linear infinite;
`;

export const SpinnerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 32px 0;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.875rem;
`;
