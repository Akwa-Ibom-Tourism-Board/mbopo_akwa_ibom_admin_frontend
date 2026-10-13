import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { StyledCheckbox, StyledIndicator } from "./Checkbox.styles";

export const Checkbox = forwardRef<
  ElementRef<typeof CheckboxPrimitive.Root>,
  ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>((props, ref) => (
  <StyledCheckbox ref={ref} {...props}>
    <StyledIndicator>
      <Check size={14} strokeWidth={3} />
    </StyledIndicator>
  </StyledCheckbox>
));
Checkbox.displayName = "Checkbox";
