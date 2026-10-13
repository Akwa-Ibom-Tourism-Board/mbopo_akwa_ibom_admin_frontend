import styled from "styled-components";
import { Link } from "react-router-dom";
import { media } from "@/theme";
import { Button, Input, PasswordInput, Label } from "@/shared/ui";

export const Heading = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.foreground};
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(28px, 4vw, 34px);
  font-weight: 700;
  letter-spacing: -0.01em;
  text-align: center;

  ${media.lg} {
    text-align: left;
  }
`;

export const Subtitle = styled.p`
  margin: 10px 0 0;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 15px;
  text-align: center;

  ${media.lg} {
    text-align: left;
  }
`;

export const FormBlock = styled.form`
  margin-top: 32px;
  text-align: left;
`;

export const Field = styled.div`
  margin-bottom: 22px;
`;

export const FieldLabel = styled(Label)`
  display: inline-block;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 14px;
  font-weight: 600;
`;

export const RequiredMark = styled.span`
  margin-left: 3px;
  color: ${({ theme }) => theme.colors.destructive.DEFAULT};
`;

// Height stays at Input's own default (2.75rem) — PasswordInput's toggle
// button is a fixed 2.75rem square that depends on that exact height to
// stay vertically centered, so only radius/border/padding are overridden
// here, on both fields, to keep the two visually identical.
export const StyledField = styled(Input)`
  border-radius: ${({ theme }) => theme.radii.lg};
  border-width: 1.5px;
  padding-left: 1.125rem;
  font-size: 0.9375rem;
`;

// PasswordInput forwards `className` onto its inner <input> (not the
// wrapper it renders alongside the toggle button), so this overrides the
// input element directly.
export const StyledPasswordField = styled(PasswordInput)`
  border-radius: ${({ theme }) => theme.radii.lg};
  border-width: 1.5px;
  padding-left: 1.125rem;
  font-size: 0.9375rem;
`;

export const ErrorText = styled.p`
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.destructive.DEFAULT};
  font-size: 13px;
`;

// Google's widget renders at a fixed ~304px width regardless of its
// container, so this just gives it the same vertical rhythm as the
// fields around it and lets it shrink-to-fit on very narrow screens.
export const CaptchaField = styled.div`
  margin-bottom: 22px;
  max-width: 100%;
  overflow-x: auto;
`;

export const OptionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: -8px 0 26px;
`;

export const RememberRow = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 13.5px;
  cursor: pointer;
`;

export const SubmitButton = styled(Button)`
  width: 100%;
  box-shadow: ${({ theme }) => theme.shadows.cta};

  &:hover:not(:disabled) {
    box-shadow: 0 16px 32px -6px
      ${({ theme }) => theme.alpha(theme.colors.secondary.DEFAULT, 0.5)};
  }

  svg {
    transition: transform ${({ theme }) => theme.transitions.fast};
  }

  &:hover:not(:disabled) svg {
    transform: translateX(3px);
  }
`;

export const FormFooter = styled.p`
  margin: 28px 0 0;
  text-align: center;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.muted.foreground};

  a {
    font-weight: 700;
    color: ${({ theme }) => theme.colors.secondary.DEFAULT};

    &:hover {
      text-decoration: underline;
    }
  }
`;

export const InlineLink = styled(Link)`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.secondary.DEFAULT};

  &:hover {
    text-decoration: underline;
  }
`;
