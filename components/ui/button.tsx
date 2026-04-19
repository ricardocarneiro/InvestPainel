import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded text-body-md font-medium transition-weighted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-container text-white hover:bg-secondary-container hover:text-on-surface shadow-ambient',
        secondary:
          'bg-transparent text-on-surface hover:bg-surface-container-high',
        gold:
          'bg-secondary-container text-primary font-semibold hover:bg-secondary hover:text-white shadow-ambient',
        ghost:
          'bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container',
        destructive:
          'bg-red-600 text-white hover:bg-red-700',
        outline:
          'border border-outline-variant bg-transparent text-on-surface hover:bg-surface-container-low',
      },
      size: {
        sm: 'h-8 px-3 text-label-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-title-sm',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
