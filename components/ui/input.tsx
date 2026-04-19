import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'h-10 w-full rounded px-3 text-body-md text-on-surface bg-surface-container-low',
            'border-0 border-b border-transparent',
            'transition-weighted',
            'focus:outline-none focus:bg-surface-container-lowest focus:border-b focus:border-primary',
            'placeholder:text-on-surface-variant/50',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-b border-red-500 bg-red-50',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-label-sm text-red-600">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
