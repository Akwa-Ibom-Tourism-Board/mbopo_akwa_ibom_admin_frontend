import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import {
  StyledContent,
  StyledLabel,
  StyledItem,
  StyledDestructiveItem,
  StyledSeparator,
} from "./DropdownMenu.styles";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export const DropdownMenuContent = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ sideOffset = 8, align = "end", ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <StyledContent ref={ref} sideOffset={sideOffset} align={align} {...props} />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuLabel = StyledLabel;
export const DropdownMenuSeparator = StyledSeparator;

export const DropdownMenuItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Item>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    destructive?: boolean;
  }
>(({ destructive = false, ...props }, ref) => {
  const Component = destructive ? StyledDestructiveItem : StyledItem;
  return <Component ref={ref} {...props} />;
});
DropdownMenuItem.displayName = "DropdownMenuItem";
