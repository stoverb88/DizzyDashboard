import React from 'react';
import { colors, transitions, shadows, borderRadius, spacing, touchTarget } from '../../styles/design-tokens';
import { triggerLightHaptic, triggerMediumHaptic } from '../../utils/haptics';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
  enableHaptic?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  enableHaptic = true,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    borderRadius: borderRadius.lg,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: `all ${transitions.base}`,
    fontFamily: 'inherit',
    textAlign: 'center',
    userSelect: 'none',
    outline: 'none',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.5 : 1,
  };

  // Size variants
  const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
    sm: {
      padding: `${spacing.sm} ${spacing.lg}`,
      fontSize: '14px',
      minHeight: touchTarget.minimum,
    },
    md: {
      padding: `${spacing.md} ${spacing.xl}`,
      fontSize: '16px',
      minHeight: touchTarget.comfortable,
    },
    lg: {
      padding: `${spacing.lg} ${spacing['2xl']}`,
      fontSize: '18px',
      minHeight: '52px',
    },
  };

  // Color variants
  const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: colors.primary[500],
      color: '#FFFFFF',
      boxShadow: shadows.primaryButton,
    },
    secondary: {
      backgroundColor: colors.neutral[100],
      color: colors.neutral[900],
      boxShadow: shadows.base,
    },
    outline: {
      backgroundColor: 'transparent',
      color: colors.primary[600],
      border: `2px solid ${colors.primary[500]}`,
      boxShadow: 'none',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.neutral[700],
      boxShadow: 'none',
    },
    danger: {
      backgroundColor: colors.clinical.danger[500],
      color: '#FFFFFF',
      boxShadow: `0 4px 15px ${colors.clinical.danger[500]}40`,
    },
  };

  // Hover styles (applied via inline event handlers for React compatibility)
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  const hoverStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: colors.primary[600],
      boxShadow: shadows.primaryButtonHover,
      transform: 'translateY(-1px)',
    },
    secondary: {
      backgroundColor: colors.neutral[200],
    },
    outline: {
      backgroundColor: colors.primary[50],
      borderColor: colors.primary[600],
    },
    ghost: {
      backgroundColor: colors.neutral[100],
    },
    danger: {
      backgroundColor: colors.clinical.danger[600],
      boxShadow: `0 6px 20px ${colors.clinical.danger[600]}40`,
      transform: 'translateY(-1px)',
    },
  };

  const pressedStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      transform: 'translateY(0px)',
      boxShadow: shadows.md,
    },
    secondary: {
      transform: 'scale(0.98)',
    },
    outline: {
      transform: 'scale(0.98)',
    },
    ghost: {
      transform: 'scale(0.98)',
    },
    danger: {
      transform: 'translateY(0px)',
      boxShadow: shadows.md,
    },
  };

  const combinedStyles: React.CSSProperties = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...(isHovered && !disabled ? hoverStyles[variant] : {}),
    ...(isPressed && !disabled ? pressedStyles[variant] : {}),
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && enableHaptic) {
      // Use medium haptic for danger variant, light for others
      if (variant === 'danger') {
        triggerMediumHaptic();
      } else {
        triggerLightHaptic();
      }
    }
    onClick?.(e);
  };

  return (
    <button
      style={combinedStyles}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}
