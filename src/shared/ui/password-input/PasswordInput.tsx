import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { InputProps } from "../input";
import {
  Wrapper,
  StyledPasswordInput,
  ToggleButton,
} from "./PasswordInput.styles";

export type PasswordInputProps = Omit<InputProps, "type">;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (props, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <Wrapper>
        <StyledPasswordInput
          ref={ref}
          type={visible ? "text" : "password"}
          {...props}
        />
        <ToggleButton
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff size={18} aria-hidden />
          ) : (
            <Eye size={18} aria-hidden />
          )}
        </ToggleButton>
      </Wrapper>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
