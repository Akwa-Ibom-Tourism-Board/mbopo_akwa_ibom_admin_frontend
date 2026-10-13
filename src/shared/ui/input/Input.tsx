import { forwardRef, type InputHTMLAttributes } from "react";
import { StyledInput } from "./Input.styles";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ invalid = false, ...props }, ref) => (
    <StyledInput
      ref={ref}
      $invalid={invalid}
      aria-invalid={invalid || undefined}
      {...props}
    />
  ),
);
Input.displayName = "Input";
