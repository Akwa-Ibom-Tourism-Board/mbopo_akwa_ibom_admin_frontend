import {
  forwardRef,
  useContext,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { StyledGroup, StyledSlot, StyledCaret } from "./OtpInput.styles";

export const OtpInput = forwardRef<
  ElementRef<typeof OTPInput>,
  ComponentPropsWithoutRef<typeof OTPInput>
>(({ containerClassName, ...props }, ref) => (
  <OTPInput ref={ref} containerClassName={containerClassName} {...props} />
));
OtpInput.displayName = "OtpInput";

export function OtpInputSlots({ length }: { length: number }) {
  const context = useContext(OTPInputContext);

  return (
    <StyledGroup>
      {Array.from({ length }).map((_, index) => {
        const slot = context.slots[index];
        return (
          <StyledSlot key={index} $active={Boolean(slot?.isActive)}>
            {slot?.char}
            {slot?.hasFakeCaret && <StyledCaret />}
          </StyledSlot>
        );
      })}
    </StyledGroup>
  );
}
