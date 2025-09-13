# Design System Documentation

## Overview
This document outlines the design tokens and system used in the tec-nova checkin system. The design system is built to ensure consistency, accessibility, and maintainability across the application.

## Color Palette

### Brand Colors
- **Primary**: `--primary` - Rich blue (#3B82F6) - Main brand color for buttons, links, and key UI elements
- **Secondary**: `--secondary` - Light gray (#F8FAFC) - Supporting backgrounds and subtle elements
- **Accent**: `--accent` - Light blue accent (#F8FAFC) - Highlights and secondary actions

### Status Colors
- **Success**: `--success` - Green (#10B981) - Success states, confirmations, positive feedback
- **Warning**: `--warning` - Orange (#F59E0B) - Warnings, cautions, attention needed
- **Error**: `--destructive` - Red (#EF4444) - Errors, failures, destructive actions
- **Info**: `--info` - Blue (#3B82F6) - Information, neutral states, guidance

### Neutral Colors
- **Background**: `--background` - White/Dark - Main background color
- **Foreground**: `--foreground` - Black/White - Main text color
- **Muted**: `--muted` - Light gray - Subtle backgrounds
- **Muted Foreground**: `--muted-foreground` - Medium gray - Secondary text
- **Border**: `--border` - Light gray - Borders and dividers

## Typography Scale

### Display Text
- **Display Large**: `text-display-lg` - 48px, Bold - Hero headlines
- **Display Medium**: `text-display-md` - 36px, Bold - Section headers
- **Display Small**: `text-display-sm` - 30px, Bold - Subsection headers

### Headings
- **Heading Large**: `text-heading-lg` - 24px, Semibold - Page titles
- **Heading Medium**: `text-heading-md` - 20px, Semibold - Card titles
- **Heading Small**: `text-heading-sm` - 18px, Semibold - Component titles

### Body Text
- **Body Large**: `text-body-lg` - 18px - Important body text
- **Body Medium**: `text-body-md` - 16px - Standard body text
- **Body Small**: `text-body-sm` - 14px - Compact body text
- **Caption**: `text-caption` - 12px - Labels and captions

## Spacing Scale

Based on a 4px base unit for consistent rhythm:
- **XS**: `space-xs` - 4px - Tight spacing
- **SM**: `space-sm` - 8px - Small spacing
- **MD**: `space-md` - 16px - Medium spacing (default)
- **LG**: `space-lg` - 24px - Large spacing
- **XL**: `space-xl` - 32px - Extra large spacing
- **2XL**: `space-2xl` - 48px - Double extra large spacing
- **3XL**: `space-3xl` - 64px - Triple extra large spacing

## Border Radius

- **XS**: `rounded-xs` - 2px - Subtle rounding
- **SM**: `rounded-sm` - 4px - Small rounding
- **MD**: `rounded-md` - 6px - Medium rounding
- **LG**: `rounded-lg` - 8px - Large rounding (default)
- **XL**: `rounded-xl` - 12px - Extra large rounding
- **2XL**: `rounded-2xl` - 16px - Double extra large rounding
- **Full**: `rounded-full` - Full circle/pill shape

## Component Elevation

- **Flat**: `card-flat` - No shadow, border only
- **Raised**: `card-raised` - Subtle shadow for slight elevation
- **Elevated**: `card-elevated` - Prominent shadow for high elevation

## Usage Guidelines

### Colors
- Use brand colors consistently for interactive elements
- Status colors should only be used for their intended purpose
- Maintain sufficient contrast ratios for accessibility (WCAG AA)

### Typography
- Use the typography scale consistently
- Maintain proper hierarchy with heading levels
- Keep line lengths readable (45-75 characters)

### Spacing
- Use the spacing scale for consistent rhythm
- Maintain adequate whitespace for breathing room
- Group related elements with appropriate spacing

### Border Radius
- Use consistent radius across similar components
- Cards and containers typically use `rounded-lg`
- Buttons use `rounded-md` for better clickability

## Accessibility

- All colors meet WCAG AA contrast requirements
- Focus states are clearly visible with ring utilities
- Typography is legible and scalable
- Interactive elements have minimum 44px touch targets

## Implementation

### CSS Custom Properties
All design tokens are implemented as CSS custom properties and are available globally.

### Utility Classes
Custom utility classes are provided for common patterns:
- Typography: `.text-display-lg`, `.text-heading-md`, etc.
- Spacing: `.space-xs`, `.space-md`, etc.
- Colors: `.text-success`, `.bg-error`, etc.
- Elevation: `.card-raised`, `.card-elevated`

### Dark Mode
All tokens automatically adapt to dark mode using the `.dark` class.