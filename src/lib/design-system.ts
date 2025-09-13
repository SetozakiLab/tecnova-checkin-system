/**
 * Design System Utilities
 * 
 * Type-safe utilities for working with design tokens and system values
 */

export const designTokens = {
  spacing: {
    xs: 'var(--spacing-xs)',
    sm: 'var(--spacing-sm)',
    md: 'var(--spacing-md)',
    lg: 'var(--spacing-lg)',
    xl: 'var(--spacing-xl)',
    '2xl': 'var(--spacing-2xl)',
    '3xl': 'var(--spacing-3xl)',
  },
  fontSize: {
    xs: 'var(--font-size-xs)',
    sm: 'var(--font-size-sm)',
    base: 'var(--font-size-base)',
    lg: 'var(--font-size-lg)',
    xl: 'var(--font-size-xl)',
    '2xl': 'var(--font-size-2xl)',
    '3xl': 'var(--font-size-3xl)',
    '4xl': 'var(--font-size-4xl)',
    '5xl': 'var(--font-size-5xl)',
  },
  borderRadius: {
    xs: 'var(--radius-xs)',
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    '2xl': 'var(--radius-2xl)',
    full: 'var(--radius-full)',
  },
  colors: {
    brand: {
      primary: 'var(--color-brand-primary)',
      secondary: 'var(--color-brand-secondary)',
      accent: 'var(--color-brand-accent)',
    },
    status: {
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      error: 'var(--color-error)',
      info: 'var(--color-info)',
    },
    semantic: {
      background: 'var(--color-background)',
      foreground: 'var(--color-foreground)',
      muted: 'var(--color-muted)',
      mutedForeground: 'var(--color-muted-foreground)',
      border: 'var(--color-border)',
      input: 'var(--color-input)',
      ring: 'var(--color-ring)',
    },
  },
} as const;

export type SpacingToken = keyof typeof designTokens.spacing;
export type FontSizeToken = keyof typeof designTokens.fontSize;
export type BorderRadiusToken = keyof typeof designTokens.borderRadius;
export type BrandColorToken = keyof typeof designTokens.colors.brand;
export type StatusColorToken = keyof typeof designTokens.colors.status;
export type SemanticColorToken = keyof typeof designTokens.colors.semantic;

/**
 * Typography variants following the design system
 */
export const typography = {
  display: {
    lg: 'text-display-lg',
    md: 'text-display-md',
    sm: 'text-display-sm',
  },
  heading: {
    lg: 'text-heading-lg',
    md: 'text-heading-md',
    sm: 'text-heading-sm',
  },
  body: {
    lg: 'text-body-lg',
    md: 'text-body-md',
    sm: 'text-body-sm',
  },
  caption: 'text-caption',
} as const;

export type TypographyVariant = 
  | keyof typeof typography.display
  | keyof typeof typography.heading
  | keyof typeof typography.body
  | 'caption';

/**
 * Spacing utilities following the design system
 */
export const spacing = {
  gap: {
    xs: 'space-xs',
    sm: 'space-sm',
    md: 'space-md',
    lg: 'space-lg',
    xl: 'space-xl',
    '2xl': 'space-2xl',
    '3xl': 'space-3xl',
  },
} as const;

/**
 * Component elevation following the design system
 */
export const elevation = {
  flat: 'card-flat',
  raised: 'card-raised',
  elevated: 'card-elevated',
} as const;

export type ElevationLevel = keyof typeof elevation;

/**
 * Utility function to get design token values programmatically
 */
export function getToken(category: keyof typeof designTokens, token: string): string {
  const tokens = designTokens[category] as Record<string, string>;
  return tokens[token] || '';
}

/**
 * Utility function to create consistent class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Status color utilities
 */
export const statusColors = {
  success: {
    text: 'text-success',
    bg: 'bg-success',
    border: 'border-success',
  },
  warning: {
    text: 'text-warning',
    bg: 'bg-warning',
    border: 'border-warning',
  },
  error: {
    text: 'text-error',
    bg: 'bg-error',
    border: 'border-error',
  },
  info: {
    text: 'text-info',
    bg: 'bg-info',
    border: 'border-info',
  },
} as const;

export type StatusType = keyof typeof statusColors;

/**
 * Helper to get status color classes
 */
export function getStatusClasses(status: StatusType, variant: 'text' | 'bg' | 'border') {
  return statusColors[status][variant];
}

/**
 * Border radius utilities
 */
export const borderRadius = {
  xs: 'rounded-xs',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
} as const;

/**
 * Focus ring utility for accessibility
 */
export const focusRing = 'focus-ring';

/**
 * Common component patterns
 */
export const patterns = {
  card: {
    default: 'card-raised rounded-lg',
    flat: 'card-flat rounded-lg',
    elevated: 'card-elevated rounded-lg',
  },
  button: {
    focus: focusRing,
    rounded: borderRadius.md,
  },
  input: {
    focus: focusRing,
    rounded: borderRadius.md,
  },
} as const;