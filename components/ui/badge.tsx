import * as React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'muted' | 'gold'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded px-2 py-0.5 text-label-sm font-medium uppercase tracking-wider',
        {
          'bg-primary/10 text-primary': variant === 'default',
          'bg-emerald-50 text-emerald-700': variant === 'success',
          'bg-amber-50 text-amber-700': variant === 'warning',
          'bg-red-50 text-red-700': variant === 'danger',
          'bg-surface-container-high text-on-surface-variant': variant === 'muted',
          'bg-secondary-container/30 text-secondary font-semibold': variant === 'gold',
        },
        className
      )}
      {...props}
    />
  )
}
