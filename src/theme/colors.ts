// Color tokens matched to the Akwa Ibom State Bursary Portal
// (bursary.akwaibomstate.gov.ng) so Mbopo Akwa Ibom shares the same
// government brand system: brand green + brand orange, neutral dark text,
// pill-shaped CTAs on solid or gradient green/orange surfaces.

export const colors = {
  background: "#FFFFFF",
  foreground: "#111928",

  card: "#FFFFFF",
  cardForeground: "#111928",

  popover: "#FFFFFF",
  popoverForeground: "#111928",

  // Brand green — used for headings, body accents and dark surfaces.
  primary: "#003922",
  primaryForeground: "#FFFFFF",

  // Brand orange — used for primary CTAs and highlight accents.
  secondary: "#FE6201",
  secondaryForeground: "#FFFFFF",

  // Exact match to the bursary portal's gray-50 — the off-white canvas
  // color behind white cards/panes, so nothing on the page sits on a flat
  // pure-white field the way it used to.
  muted: "#F9FAFB",
  mutedForeground: "#6B7280",

  // Orange hover shade — used for hover fills on outline/ghost elements.
  accent: "#CB4E01",
  accentForeground: "#FFFFFF",

  destructive: "#EF4444",
  destructiveForeground: "#FFFFFF",

  border: "#E5E7EB",
  input: "#E5E7EB",
  ring: "#FE6201",

  white: "#FFFFFF",
  black: "#000000",

  // Dropdown/nav hover green — distinct from `primary`.
  navHover: "#002F20",

  // Highlight accent — brand orange, used for small decorative touches
  // (quote rules, dot textures, icon rings) instead of a one-off yellow.
  highlight: "#FE6201",
  highlightMuted: "#FFE0CC",

  // Neutral grays for chrome that isn't tied to the brand palette.
  gray700: "#374151",
  gray500: "#6B7280",

  // Mid stop of the hero gradient — brand green hover shade.
  primaryLight: "#002F20",
  // Near-black with a hint of green — dark end of the hero gradient.
  heroDeep: "#00120C",

  servicesBackground: "#F9FAFB",

  // Footer gradient stops — exact match to the bursary portal footer.
  footerDark: "#00120C",
  footerGlow: "#01251A",

  // Shared blend backing the WhyEnterSection + ValuesSection pair — the
  // two render as one continuous panel with a single gradient behind
  // them, not two separately-colored sections. Brand green tones, dark
  // to darker, matching the bursary portal's dark-green highlight bands.
  platformBlendTop: "#003922",
  platformBlendMid: "#002614",
  platformBlendBottom: "#001D0F",

  // Solid dark-green section background + card cell fill, used by
  // EligibilitySection's requirements panel — exact bursary portal tones.
  sectionDark: "#01251A",
  sectionDarkCard: "#02301F",
} as const;

export type ColorTokens = Record<keyof typeof colors, string>;
