export const lolaSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
} as const;

export const lolaRadii = {
  sm: 10,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const lolaShadows = {
  card: "0 8px 28px rgba(15, 23, 42, 0.12)",
  focus: "0 0 0 4px rgba(59, 130, 246, 0.35)",
} as const;

export const lolaFontSizes = {
  xs: 14,
  sm: 16,
  base: 18,
  lg: 22,
  xl: 26,
  "2xl": 30,
} as const;

export const lolaLineHeights = {
  tight: 1.2,
  snug: 1.35,
  base: 1.5,
  relaxed: 1.65,
} as const;

export const lolaHeights = {
  control: 56,
  primaryButton: 56,
  secondaryButton: 52,
  row: 64,
  header: 72,
} as const;

export const lolaPalette = {
  background: "#F8FAFC",
  surface: "#FFFFFF",
  text: "#0F172A",
  mutedText: "#475569",
  border: "#E2E8F0",
  accent: "#2563EB",
  accentStrong: "#1D4ED8",
  success: "#16A34A",
  warning: "#EA580C",
  danger: "#DC2626",
} as const;

export const lolaTokens = {
  spacing: lolaSpacing,
  radii: lolaRadii,
  shadows: lolaShadows,
  fontSizes: lolaFontSizes,
  lineHeights: lolaLineHeights,
  heights: lolaHeights,
  palette: lolaPalette,
} as const;

export type LolaTokens = typeof lolaTokens;
