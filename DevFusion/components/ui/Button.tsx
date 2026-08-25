import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-label-bold text-label-bold rounded transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    const variants = {
      primary:
        'bg-primary-container text-on-primary hover:bg-primary border border-primary-container shadow-sm focus:ring-primary',
      secondary:
        'bg-surface text-on-primary-fixed-variant border border-outline-variant hover:bg-surface-container-low shadow-sm focus:ring-outline',
      outline:
        'bg-transparent text-on-surface border border-outline hover:bg-surface-container-low focus:ring-outline',
      ghost:
        'bg-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-primary focus:ring-outline',
      danger:
        'bg-error text-on-error hover:bg-error/90 border border-error shadow-sm focus:ring-error',
    };

    const sizes = {
      sm: 'py-1.5 px-3 text-xs gap-1.5',
      md: 'py-2.5 px-4 text-sm gap-2',
      lg: 'py-3 px-6 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {icon && iconPosition === 'left' && (
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
