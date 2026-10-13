import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import {
  StyledTrigger,
  StyledContent,
  StyledViewport,
  StyledItem,
  StyledItemIndicator,
  StyledLabel,
  StyledSeparator,
  StyledScrollButton,
} from "./Select.styles";

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = forwardRef<
  ElementRef<typeof SelectPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    invalid?: boolean;
  }
>(({ children, invalid = false, ...props }, ref) => (
  <StyledTrigger
    ref={ref}
    $invalid={invalid}
    aria-invalid={invalid || undefined}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown size={16} />
    </SelectPrimitive.Icon>
  </StyledTrigger>
));
SelectTrigger.displayName = "SelectTrigger";

export const SelectContent = forwardRef<
  ElementRef<typeof SelectPrimitive.Content>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <StyledContent ref={ref} position={position} {...props}>
      <SelectPrimitive.ScrollUpButton asChild>
        <StyledScrollButton>
          <ChevronUp size={14} />
        </StyledScrollButton>
      </SelectPrimitive.ScrollUpButton>
      <StyledViewport>{children}</StyledViewport>
      <SelectPrimitive.ScrollDownButton asChild>
        <StyledScrollButton>
          <ChevronDown size={14} />
        </StyledScrollButton>
      </SelectPrimitive.ScrollDownButton>
    </StyledContent>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = "SelectContent";

export const SelectLabel = StyledLabel;
export const SelectSeparator = StyledSeparator;

export const SelectItem = forwardRef<
  ElementRef<typeof SelectPrimitive.Item>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ children, ...props }, ref) => (
  <StyledItem ref={ref} {...props}>
    <StyledItemIndicator>
      <Check size={14} />
    </StyledItemIndicator>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </StyledItem>
));
SelectItem.displayName = "SelectItem";
