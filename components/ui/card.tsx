import * as React from "react"
import { cn } from "../../lib/utils"
import { colors, shadows, borderRadius, spacing, transitions } from "../../styles/design-tokens"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'clinical';
  hoverable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hoverable = false, style, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        backgroundColor: colors.background.primary,
        border: `1px solid ${colors.neutral[200]}`,
        boxShadow: shadows.sm,
      },
      elevated: {
        backgroundColor: colors.background.primary,
        border: 'none',
        boxShadow: shadows.lg,
      },
      outlined: {
        backgroundColor: colors.background.primary,
        border: `2px solid ${colors.primary[200]}`,
        boxShadow: 'none',
      },
      clinical: {
        backgroundColor: colors.background.primary,
        border: `1px solid ${colors.neutral[200]}`,
        boxShadow: shadows.md,
        borderLeft: `4px solid ${colors.primary[500]}`,
      },
    };

    const hoverStyles: React.CSSProperties = hoverable ? {
      boxShadow: shadows.xl,
      transform: 'translateY(-2px)',
    } : {};

    const combinedStyles: React.CSSProperties = {
      borderRadius: borderRadius.lg,
      transition: transitions.base,
      ...variantStyles[variant],
      ...(isHovered ? hoverStyles : {}),
      ...style,
    };

    return (
      <div
        ref={ref}
        className={cn("", className)}
        style={combinedStyles}
        onMouseEnter={() => hoverable && setIsHovered(true)}
        onMouseLeave={() => hoverable && setIsHovered(false)}
        {...props}
      />
    );
  }
);
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("", className)}
    style={{
      padding: spacing.xl,
      paddingBottom: 0,
      ...style,
    }}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("", className)}
    style={{
      padding: spacing.xl,
      paddingTop: spacing.md,
      ...style,
    }}
    {...props}
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("", className)}
    style={{
      padding: spacing.xl,
      paddingTop: 0,
      display: 'flex',
      alignItems: 'center',
      gap: spacing.md,
      ...style,
    }}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardContent, CardFooter } 