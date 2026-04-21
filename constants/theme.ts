/**
 * FairDrive Design System
 *
 * Premium editorial aesthetic inspired by GOAT, HouseSigma, NYT.
 * Serif display for prices/headlines, clean sans for UI, mono for numbers.
 */

export const colors = {
  // Core palette — near-white backgrounds, near-black text
  background: "#FAFAF8",
  surface: "#FFFFFF",
  text: "#1A1A1A",
  textSecondary: "#6B6B6B",
  textTertiary: "#9E9E9E",

  // Borders — hairline, subtle
  border: "#E8E8E6",
  borderLight: "#F0F0EE",

  // Accent — one signature color, used sparingly
  accent: "#1B6B4A",
  accentLight: "#E8F5EE",
  accentDark: "#145236",

  // Semantic
  verified: "#1B6B4A",
  unverified: "#9E9E9E",
  error: "#C4432B",
  warning: "#D4880F",

  // Price markup severity (for Report screen live preview)
  priceGood: "#1B6B4A",
  priceFair: "#D4880F",
  priceHigh: "#C4432B",

  // Tab bar
  tabActive: "#1A1A1A",
  tabInactive: "#9E9E9E",
} as const;

export const fonts = {
  // Serif display — big prices, headlines, editorial moments
  serif: "Fraunces_400Regular",
  serifMedium: "Fraunces_500Medium",
  serifSemiBold: "Fraunces_600SemiBold",
  serifBold: "Fraunces_700Bold",

  // Sans — UI text, body copy, labels
  sans: "Inter_400Regular",
  sansMedium: "Inter_500Medium",
  sansSemiBold: "Inter_600SemiBold",
  sansBold: "Inter_700Bold",

  // Mono — all numeric data, prices in tables, stats
  mono: "JetBrainsMono_400Regular",
  monoMedium: "JetBrainsMono_500Medium",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 9999,
} as const;

export const typography = {
  // Big editorial price display (Results screen hero)
  priceHero: {
    fontFamily: fonts.serifBold,
    fontSize: 48,
    lineHeight: 56,
    color: colors.text,
    letterSpacing: -1.5,
  },

  // Section headlines
  h1: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 28,
    lineHeight: 34,
    color: colors.text,
    letterSpacing: -0.5,
  },

  h2: {
    fontFamily: fonts.serifMedium,
    fontSize: 22,
    lineHeight: 28,
    color: colors.text,
  },

  h3: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 17,
    lineHeight: 22,
    color: colors.text,
  },

  // Body text
  body: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },

  bodySmall: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  // Labels and captions
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textTertiary,
    letterSpacing: 0.5,
  },

  // Mono number displays
  number: {
    fontFamily: fonts.mono,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },

  numberLarge: {
    fontFamily: fonts.monoMedium,
    fontSize: 20,
    lineHeight: 28,
    color: colors.text,
  },

  // Tab bar labels
  tab: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    lineHeight: 14,
  },
} as const;
