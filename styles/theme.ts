import {
  blue,
  blueDark,
  gray,
  grayDark,
  green,
  greenDark,
  red,
  redDark,
  yellow,
  yellowDark,
} from "@radix-ui/colors";

const colors = {
  white: "#ffffff",
  black: "#000000",
  gray,
  grayDark,
  blue,
  blueDark,
  green,
  greenDark,
  red,
  redDark,
  yellow,
  yellowDark,
};

const typography = {
  font: {
    regular: "System",
    mono: "SpaceMono",
  },
  fontSize: {
    xxs: 8,
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    display: 36,
    hero: 48,
    giant: 60,
  },
  fontWeight: {
    thin: "100" as const,
    extraLight: "200" as const,
    light: "300" as const,
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    extraBold: "800" as const,
    black: "900" as const,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
  },
} as const;

const radius = {
  none: 0,
  sm: 2,
  base: 4,
  md: 6,
  lg: 8,
  xl: 12,
  xxl: 16,
  xxxl: 24,
  round: 32,
  full: 9999,
} as const;

const shadow = {
  none: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  base: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  xl: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  xxl: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
} as const;

const container = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
} as const;

const zIndex = {
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
} as const;

const utils = {
  /** Calculate spacing: space(4) = 16px */
  space: (v: number) => v * 4,
  /** Calculate gap: gap(3) = 12px */
  gap: (v: number) => v * 4,
  /** Calculate size: size(16) = 64px */
  size: (v: number) => v * 4,
};

export const lightTheme = {
  colors: {
    background: colors.white,
    foreground: colors.gray.gray12,

    card: colors.white,
    cardForeground: colors.gray.gray12,

    primary: colors.blue.blue9,
    primaryForeground: colors.white,

    secondary: colors.gray.gray4,
    secondaryForeground: colors.gray.gray12,

    muted: colors.gray.gray3,
    mutedForeground: colors.gray.gray11,

    destructive: colors.red.red9,
    destructiveForeground: colors.white,

    border: colors.gray.gray6,
    input: colors.gray.gray8,
    ring: colors.blue.blue8,

    success: colors.green.green9,
    successForeground: colors.white,
    overlay: "#26000000",
    destructiveOverlay: "#B3C80000",
  },
  ...typography,
  radius,
  shadow,
  container,
  zIndex,
  ...utils,
} as const;

export const darkTheme = {
  colors: {
    background: "#000",
    foreground: "#fff",

    card: "#1c1c1e",
    cardForeground: "#fff",

    primary: "#1a73e8",
    primaryForeground: "#fff",

    secondary: "#333",
    secondaryForeground: "#fff",

    muted: "#333",
    mutedForeground: "#999",

    destructive: "#e53935",
    destructiveForeground: "#fff",

    border: "#333",
    input: "#666",
    ring: "#1a73e8",

    success: "#4caf50",
    successForeground: "#fff",
    overlay: "#4D000000",
    destructiveOverlay: "#CCC80000",
  },
  ...typography,
  radius,
  shadow,
  container,
  zIndex,
  ...utils,
} as const;

export type AppTheme = typeof darkTheme;

export { colors, radius, shadow, typography };
