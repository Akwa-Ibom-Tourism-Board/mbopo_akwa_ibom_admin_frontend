import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactElement,
} from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { X } from "lucide-react";
import {
  StyledViewport,
  StyledToast,
  StyledAction,
  StyledClose,
  StyledTitle,
  StyledDescription,
  type ToastVariant,
} from "./Toast.styles";

export const ToastProvider = ToastPrimitives.Provider;

export const ToastViewport = forwardRef<
  ElementRef<typeof ToastPrimitives.Viewport>,
  ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>((props, ref) => <StyledViewport ref={ref} {...props} />);
ToastViewport.displayName = "ToastViewport";

export type ToastProps = ComponentPropsWithoutRef<
  typeof ToastPrimitives.Root
> & { variant?: ToastVariant };

export const Toast = forwardRef<
  ElementRef<typeof ToastPrimitives.Root>,
  ToastProps
>(({ variant = "default", ...props }, ref) => (
  <StyledToast ref={ref} $variant={variant} {...props} />
));
Toast.displayName = "Toast";

export const ToastAction = forwardRef<
  ElementRef<typeof ToastPrimitives.Action>,
  ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>((props, ref) => <StyledAction ref={ref} {...props} />);
ToastAction.displayName = "ToastAction";

export const ToastClose = forwardRef<
  ElementRef<typeof ToastPrimitives.Close>,
  ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>((props, ref) => (
  <StyledClose ref={ref} toast-close="" {...props}>
    <X size={16} />
  </StyledClose>
));
ToastClose.displayName = "ToastClose";

export const ToastTitle = forwardRef<
  ElementRef<typeof ToastPrimitives.Title>,
  ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>((props, ref) => <StyledTitle ref={ref} {...props} />);
ToastTitle.displayName = "ToastTitle";

export const ToastDescription = forwardRef<
  ElementRef<typeof ToastPrimitives.Description>,
  ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>((props, ref) => <StyledDescription ref={ref} {...props} />);
ToastDescription.displayName = "ToastDescription";

export type ToastActionElement = ReactElement<typeof ToastAction>;
