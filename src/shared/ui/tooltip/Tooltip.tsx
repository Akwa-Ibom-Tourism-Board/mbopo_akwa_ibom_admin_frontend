import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import styled from "styled-components";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

const StyledContent = styled(TooltipPrimitive.Content)`
  z-index: ${({ theme }) => theme.zIndex.modal};
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.popover};
  color: ${({ theme }) => theme.colors.popoverForeground};
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

export const TooltipContent = forwardRef<
  ElementRef<typeof TooltipPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ sideOffset = 4, ...props }, ref) => (
  <StyledContent ref={ref} sideOffset={sideOffset} {...props} />
));
TooltipContent.displayName = "TooltipContent";
