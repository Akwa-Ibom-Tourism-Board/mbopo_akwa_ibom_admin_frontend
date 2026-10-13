import type { ColorTokens } from "./colors";
import { colors } from "./colors";
import { withAlpha } from "./utils";

// Same reference-shaped composition (colors as {DEFAULT,foreground} pairs,
// gradients, shadows, radii, fonts, breakpoints, container, zIndex,
// transitions) built as a factory so the theme has one predictable shape.
export const buildTheme = (tokens: ColorTokens) =>
  ({
    colors: {
      background: tokens.background,
      foreground: tokens.foreground,

      card: tokens.card,
      cardForeground: tokens.cardForeground,

      popover: tokens.popover,
      popoverForeground: tokens.popoverForeground,

      primary: {
        DEFAULT: tokens.primary,
        foreground: tokens.primaryForeground,
      },
      secondary: {
        DEFAULT: tokens.secondary,
        foreground: tokens.secondaryForeground,
      },
      muted: {
        DEFAULT: tokens.muted,
        foreground: tokens.mutedForeground,
      },
      accent: {
        DEFAULT: tokens.accent,
        foreground: tokens.accentForeground,
      },
      destructive: {
        DEFAULT: tokens.destructive,
        foreground: tokens.destructiveForeground,
      },

      border: tokens.border,
      input: tokens.input,
      ring: tokens.ring,

      white: tokens.white,
      black: tokens.black,

      navHover: tokens.navHover,
      highlight: tokens.highlight,
      highlightMuted: tokens.highlightMuted,
      gray700: tokens.gray700,
      gray500: tokens.gray500,
      primaryLight: tokens.primaryLight,
      heroDeep: tokens.heroDeep,
      servicesBackground: tokens.servicesBackground,
      footerDark: tokens.footerDark,
      footerGlow: tokens.footerGlow,
      sectionDark: tokens.sectionDark,
      sectionDarkCard: tokens.sectionDarkCard,
    },

    alpha: withAlpha,

    gradients: {
      hero: `linear-gradient(135deg, ${withAlpha(tokens.primary, 0.95)}, ${withAlpha(tokens.primaryLight, 0.9)})`,
      accent: `linear-gradient(135deg, ${tokens.secondary}, #EB9A4C)`,
      heroScene: `linear-gradient(135deg, ${tokens.primary} 0%, ${tokens.heroDeep} 55%, ${tokens.black} 100%)`,
      panel: `linear-gradient(160deg, ${tokens.primary} 0%, ${tokens.heroDeep} 100%)`,
      // Exact match to the bursary portal footer: dark green fading to
      // near-black, top to bottom.
      footer: `linear-gradient(180deg, ${tokens.footerGlow} 0%, #001C14 55%, ${tokens.footerDark} 100%)`,
      // Backs WhyEnterSection + ValuesSection together as one continuous
      // panel — applied to a wrapper spanning both, not to each section
      // individually, so there's no seam between them.
      platform: `linear-gradient(180deg, ${tokens.platformBlendTop} 0%, ${tokens.platformBlendMid} 55%, ${tokens.platformBlendBottom} 100%)`,
    },

    shadows: {
      sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      elegant: `0 10px 40px -10px ${withAlpha(tokens.primary, 0.2)}`,
      // Colored shadow for the brand-orange pill CTAs — mirrors the
      // bursary portal's shadow-primary/30 treatment.
      cta: `0 11px 25px -5px ${withAlpha(tokens.secondary, 0.35)}`,
    },

    radii: {
      sm: "0.25rem",
      md: "0.375rem",
      lg: "0.5rem",
      xl: "0.75rem",
      "2xl": "1rem",
      full: "9999px",
    },

    fonts: {
      sans: "'Montserrat', system-ui, sans-serif",
      display: "'Playfair Display', serif",
    },

    breakpoints: {
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },

    zIndex: {
      dropdown: 40,
      sticky: 45,
      topBar: 50,
      navbar: 50,
      floatingAction: 55,
      modal: 60,
    },

    transitions: {
      fast: "150ms ease",
      base: "300ms ease",
      slow: "500ms ease",
    },
  }) as const;

export const theme = buildTheme(colors);

export type Theme = ReturnType<typeof buildTheme>;
