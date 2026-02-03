export const breakpoints = {
  /** Phone (portrait) */
  initial: 0,
  /** Phone (landscape) */
  xs: 520,
  /** Tablet (portrait) */
  sm: 768,
  /** Tablet (landscape) */
  md: 1024,
  /** Laptop */
  lg: 1280,
  /** Desktop */
  xl: 1640,
  /** Tv */
  xxl: 1920,
} as const;

export type AppBreakpoints = typeof breakpoints;
