import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
} from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import {
  StyledOverlay,
  StyledContent,
  StyledClose,
  StyledHeader,
  StyledFooter,
  StyledTitle,
  StyledDescription,
} from "./Dialog.styles";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    hideClose?: boolean;
  }
>(({ children, hideClose = false, ...props }, ref) => (
  <DialogPortal>
    <StyledOverlay />
    <StyledContent ref={ref} {...props}>
      {children}
      {!hideClose && (
        <StyledClose aria-label="Close">
          <X size={16} />
        </StyledClose>
      )}
    </StyledContent>
  </DialogPortal>
));
DialogContent.displayName = "DialogContent";

export const DialogHeader = (props: HTMLAttributes<HTMLDivElement>) => (
  <StyledHeader {...props} />
);
export const DialogFooter = (props: HTMLAttributes<HTMLDivElement>) => (
  <StyledFooter {...props} />
);

export const DialogTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>((props, ref) => <StyledTitle ref={ref} {...props} />);
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>((props, ref) => <StyledDescription ref={ref} {...props} />);
DialogDescription.displayName = "DialogDescription";
