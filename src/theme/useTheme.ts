import { useTheme as useStyledTheme } from "styled-components";
import type { Theme } from "./theme";

// Typed re-export of styled-components' theme hook so feature code pulls
// tokens from one place: `const theme = useTheme(); theme.colors.primary.DEFAULT`
export const useTheme = (): Theme => useStyledTheme() as Theme;
