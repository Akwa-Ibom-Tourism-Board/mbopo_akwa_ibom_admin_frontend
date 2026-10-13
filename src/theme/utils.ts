// Turns a `#rgb`/`#rrggbb` hex token into an `rgba(r, g, b, alpha)` string,
// or passes an already-`rgba(...)`/`rgb(...)` token through unchanged (dark
// tokens like `border` are sometimes expressed directly as an alpha color).
export const withAlpha = (color: string, alpha: number): string => {
  if (!color.startsWith("#")) return color;

  const hex = color.replace("#", "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  const value = parseInt(full, 16);

  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
