import styled, { css } from "styled-components";

export type BadgeTone =
  "neutral" | "primary" | "secondary" | "success" | "danger";

const tones = {
  neutral: css`
    background: ${({ theme }) => theme.colors.muted.DEFAULT};
    color: ${({ theme }) => theme.colors.muted.foreground};
  `,
  primary: css`
    background: ${({ theme }) => theme.alpha(theme.colors.primary.DEFAULT, 0.12)};
    color: ${({ theme }) => theme.colors.primary.DEFAULT};
  `,
  secondary: css`
    background: ${({ theme }) => theme.alpha(theme.colors.secondary.DEFAULT, 0.15)};
    color: ${({ theme }) => theme.colors.foreground};
  `,
  success: css`
    background: ${({ theme }) => theme.colors.primary.DEFAULT};
    color: ${({ theme }) => theme.colors.primary.foreground};
  `,
  danger: css`
    background: ${({ theme }) => theme.alpha(theme.colors.destructive.DEFAULT, 0.12)};
    color: ${({ theme }) => theme.colors.destructive.DEFAULT};
  `,
};

export const Badge = styled.span<{ $tone?: BadgeTone }>`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  ${({ $tone = "neutral" }) => tones[$tone]}
`;
