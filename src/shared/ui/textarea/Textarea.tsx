import { forwardRef, type TextareaHTMLAttributes } from "react";
import { StyledTextarea } from "./Textarea.styles";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ invalid = false, ...props }, ref) => (
    <StyledTextarea
      ref={ref}
      $invalid={invalid}
      aria-invalid={invalid || undefined}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
