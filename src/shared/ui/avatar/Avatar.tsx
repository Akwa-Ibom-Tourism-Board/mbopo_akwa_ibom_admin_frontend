import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { StyledRoot, StyledImage, StyledFallback } from "./Avatar.styles";

export const Avatar = forwardRef<
  ElementRef<typeof AvatarPrimitive.Root>,
  ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>((props, ref) => <StyledRoot ref={ref} {...props} />);
Avatar.displayName = "Avatar";

export const AvatarImage = forwardRef<
  ElementRef<typeof AvatarPrimitive.Image>,
  ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>((props, ref) => <StyledImage ref={ref} {...props} />);
AvatarImage.displayName = "AvatarImage";

export const AvatarFallback = forwardRef<
  ElementRef<typeof AvatarPrimitive.Fallback>,
  ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>((props, ref) => <StyledFallback ref={ref} {...props} />);
AvatarFallback.displayName = "AvatarFallback";
