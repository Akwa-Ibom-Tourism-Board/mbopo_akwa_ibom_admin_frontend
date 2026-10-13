import styled, { keyframes } from "styled-components";
import * as DialogPrimitive from "@radix-ui/react-dialog";

const overlayIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const contentIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

export const StyledOverlay = styled(DialogPrimitive.Overlay)`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.zIndex.modal};
  background: rgba(0, 0, 0, 0.8);
  animation: ${overlayIn} 200ms ease-out;
`;

export const StyledContent = styled(DialogPrimitive.Content)`
  position: fixed;
  left: 50%;
  top: 50%;
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: grid;
  width: 90%;
  max-width: 32rem;
  max-height: 85vh;
  overflow-y: auto;
  transform: translate(-50%, -50%);
  gap: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border-radius: ${({ theme }) => theme.radii.lg};
  animation: ${contentIn} 200ms ease-out;

  &:focus {
    outline: none;
  }
`;

export const StyledClose = styled(DialogPrimitive.Close)`
  position: absolute;
  right: 1rem;
  top: 1rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: transparent;
  border: none;
  opacity: 0.7;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.foreground};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  transition: opacity ${({ theme }) => theme.transitions.fast};

  &:hover {
    opacity: 1;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.ring};
    outline-offset: 2px;
  }
`;

export const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  text-align: center;

  @media (min-width: 640px) {
    text-align: left;
  }
`;

export const StyledFooter = styled.div`
  display: flex;
  flex-direction: column-reverse;
  /* Was only set inside the >=640px branch below, so stacked buttons on
     small screens (the column-reverse layout) had zero gap and touched. */
  gap: 0.5rem;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: flex-end;
  }
`;

export const StyledTitle = styled(DialogPrimitive.Title)`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.foreground};
`;

export const StyledDescription = styled(DialogPrimitive.Description)`
  margin: 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.muted.foreground};
`;
