import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import styled from "styled-components";

const StyledLabel = styled(LabelPrimitive.Root)`
  display: inline-block;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.foreground};
  line-height: 1.3;

  &[data-disabled] {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const Label = forwardRef<
  ElementRef<typeof LabelPrimitive.Root>,
  ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>((props, ref) => <StyledLabel ref={ref} {...props} />);
Label.displayName = "Label";
