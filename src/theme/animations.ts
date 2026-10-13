import { keyframes } from "styled-components";
import { colors } from "./colors";
import { withAlpha } from "./utils";

export const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const slowZoom = keyframes`
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.1);
  }
`;

export const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

export const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// A constant "breathing" halo for a pill-shaped CTA. Uses the raw light
// color tokens directly (not `theme.alpha`) since `keyframes` content is
// static CSS text with no access to the styled-components theme via props.
export const glowPulse = keyframes`
  0%, 100% {
    box-shadow:
      0 0 0 0 ${withAlpha(colors.secondary, 0.45)},
      0 0 18px 4px ${withAlpha(colors.secondary, 0.4)};
  }
  50% {
    box-shadow:
      0 0 0 0 ${withAlpha(colors.secondary, 0.3)},
      0 0 34px 12px ${withAlpha(colors.secondary, 0.6)};
  }
`;
