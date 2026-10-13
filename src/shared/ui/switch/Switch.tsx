import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { StyledRoot, StyledThumb } from "./Switch.styles";

export const Switch = forwardRef<
  ElementRef<typeof SwitchPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>((props, ref) => (
  <StyledRoot ref={ref} {...props}>
    <StyledThumb />
  </StyledRoot>
));
Switch.displayName = "Switch";
