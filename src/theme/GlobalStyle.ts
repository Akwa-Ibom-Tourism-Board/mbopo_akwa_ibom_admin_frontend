import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    border-color: ${({ theme }) => theme.colors.border};
  }

  :root {
    color-scheme: light;
    /* Navbar measures its own real rendered height (disclaimer strip +
       nav row, which both vary by breakpoint and text wrapping) and
       overwrites this via ResizeObserver — this is only the pre-JS/
       fallback value, close to the common single-line desktop height. */
    --site-header-height: 104px;
  }

  html {
    scroll-behavior: smooth;
    /* Keeps hash-linked sections from landing underneath the fixed Navbar,
       which now also carries the DisclaimerStrip above the nav row. */
    scroll-padding-top: calc(var(--site-header-height) + 12px);
  }

  body {
    margin: 0;
    /* The bursary portal's own off-white canvas (gray-50), not a flat
       pure white, sits behind every section's own explicit background. */
    background: ${({ theme }) => theme.colors.muted.DEFAULT};
    color: ${({ theme }) => theme.colors.foreground};
    font-family: ${({ theme }) => theme.fonts.sans};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition: background-color ${({ theme }) => theme.transitions.base}, color ${({ theme }) => theme.transitions.base};
  }

  img {
    max-width: 100%;
    display: block;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font-family: inherit;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;
