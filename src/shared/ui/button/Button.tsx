import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import {
  StyledButton,
  type ButtonVariant,
  type ButtonSize,
} from "./Button.styles";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "default", size = "default", asChild = false, ...props },
    ref,
  ) => (
    <StyledButton
      as={asChild ? Slot : "button"}
      $variant={variant}
      $size={size}
      ref={ref}
      {...props}
    />
  ),
);
Button.displayName = "Button";
