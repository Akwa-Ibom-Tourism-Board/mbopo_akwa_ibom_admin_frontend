import styled, { css } from "styled-components";

export type ButtonVariant =
  "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
export type ButtonSize = "default" | "sm" | "lg" | "icon";

const variantStyles = {
  default: css`
    background: ${({ theme }) => theme.colors.primary.DEFAULT};
    color: ${({ theme }) => theme.colors.primary.foreground};

    &:hover {
      background: ${({ theme }) => theme.alpha(theme.colors.primary.DEFAULT, 0.9)};
    }
  `,
  destructive: css`
    background: ${({ theme }) => theme.colors.destructive.DEFAULT};
    color: ${({ theme }) => theme.colors.destructive.foreground};

    &:hover {
      background: ${({ theme }) => theme.alpha(theme.colors.destructive.DEFAULT, 0.9)};
    }
  `,
  // Bursary never floods an outline/ghost element with a solid orange
  // fill on hover; orange only ever shows there as a light tint (its own
  // "hover:bg-primary/10" pattern), reserving the solid fill for actual
  // primary CTAs. Mirrored here with a translucent tint instead of
  // \`accent.DEFAULT\` as a solid background.
  outline: css`
    background: ${({ theme }) => theme.colors.background};
    border: 1px solid ${({ theme }) => theme.colors.input};
    color: ${({ theme }) => theme.colors.foreground};

    &:hover {
      border-color: ${({ theme }) => theme.colors.secondary.DEFAULT};
      background: ${({ theme }) => theme.alpha(theme.colors.secondary.DEFAULT, 0.08)};
      color: ${({ theme }) => theme.colors.secondary.DEFAULT};
    }
  `,
  secondary: css`
    background: ${({ theme }) => theme.colors.secondary.DEFAULT};
    color: ${({ theme }) => theme.colors.secondary.foreground};

    &:hover {
      background: ${({ theme }) => theme.alpha(theme.colors.secondary.DEFAULT, 0.85)};
    }
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.foreground};

    &:hover {
      background: ${({ theme }) => theme.alpha(theme.colors.secondary.DEFAULT, 0.08)};
      color: ${({ theme }) => theme.colors.secondary.DEFAULT};
    }
  `,
  link: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.primary.DEFAULT};
    text-underline-offset: 4px;

    &:hover {
      text-decoration: underline;
    }
  `,
} as const;

const sizeStyles = {
  default: css`
    height: 2.5rem;
    padding: 0.5rem 1.25rem;
  `,
  sm: css`
    height: 2.25rem;
    padding: 0 0.75rem;
  `,
  lg: css`
    height: 3rem;
    padding: 0 2rem;
  `,
  icon: css`
    height: 2.5rem;
    width: 2.5rem;
    padding: 0;
  `,
} as const;

export const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap;
  border-radius: ${({ theme }) => theme.radii.full};
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  width: auto;
  cursor: pointer;
  transition:
    color ${({ theme }) => theme.transitions.fast},
    background-color ${({ theme }) => theme.transitions.fast},
    transform ${({ theme }) => theme.transitions.fast};

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.ring};
    outline-offset: 2px;
  }

  &:disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  svg {
    pointer-events: none;
    flex-shrink: 0;
  }

  ${({ $variant }) => variantStyles[$variant]}
  ${({ $size }) => sizeStyles[$size]}
`;
