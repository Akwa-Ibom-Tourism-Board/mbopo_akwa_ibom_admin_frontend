import styled, { css, keyframes } from "styled-components";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { media } from "@/theme";

export type ToastVariant = "default" | "destructive";

export const StyledViewport = styled(ToastPrimitives.Viewport)`
  position: fixed;
  top: 0;
  z-index: 100;
  display: flex;
  max-height: 100vh;
  width: 100%;
  flex-direction: column-reverse;
  padding: 1rem;
  margin: 0;
  list-style: none;

  ${media.sm} {
    bottom: 0;
    right: 0;
    top: auto;
    flex-direction: column;
  }

  ${media.md} {
    max-width: 420px;
  }
`;

const slideIn = keyframes`
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const variantStyles = {
  default: css`
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.foreground};
    border: 1px solid ${({ theme }) => theme.colors.border};
  `,
  destructive: css`
    background: ${({ theme }) => theme.colors.destructive.DEFAULT};
    color: ${({ theme }) => theme.colors.destructive.foreground};
    border: 1px solid ${({ theme }) => theme.colors.destructive.DEFAULT};
  `,
} as const;

export const StyledToast = styled(ToastPrimitives.Root)<{
  $variant: ToastVariant;
}>`
  pointer-events: auto;
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 1.5rem 2rem 1.5rem 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  margin-top: 0.5rem;

  &[data-state="open"] {
    animation: ${slideIn} 200ms ease-out;
  }

  &[data-state="closed"] {
    animation: ${fadeOut} 150ms ease-in;
  }

  ${({ $variant }) => variantStyles[$variant]}
`;

export const StyledAction = styled(ToastPrimitives.Action)`
  display: inline-flex;
  height: 2rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  padding: 0 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  color: inherit;
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.secondary.DEFAULT};
  }
`;

export const StyledClose = styled(ToastPrimitives.Close)`
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 0.25rem;
  border: none;
  background: transparent;
  cursor: pointer;
  color: inherit;
  opacity: 0.5;
  display: flex;
  transition: opacity ${({ theme }) => theme.transitions.fast};

  &:hover {
    opacity: 1;
  }
`;

export const StyledTitle = styled(ToastPrimitives.Title)`
  font-size: 0.875rem;
  font-weight: 600;
`;

export const StyledDescription = styled(ToastPrimitives.Description)`
  font-size: 0.875rem;
  opacity: 0.9;
`;

export const StyledTextGroup = styled.div`
  display: grid;
  gap: 0.25rem;
`;
