import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'warning' | 'container';
}

export function Card({
  className,
  variant = 'default',
  children,
  ...props
}: CardProps) {
  const variants = {
    default:
      'bg-surface border border-outline-variant rounded-lg p-5 shadow-[0px_2px_4px_rgba(0,0,0,0.05)]',
    flat: 'bg-surface border border-outline-variant rounded p-5 shadow-sm',
    warning:
      'bg-warning-container border-2 border-warning rounded-lg p-5 shadow-[0px_2px_4px_rgba(0,0,0,0.05)] relative overflow-hidden',
    container: 'bg-surface-container-lowest border border-outline-variant rounded-lg p-4',
  };

  return (
    <div className={cn(variants[variant], className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex justify-between items-start mb-3', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-headline-md font-headline-md text-on-surface', className)}
      {...props}
    >
      {children}
    </h3>
  );
}
