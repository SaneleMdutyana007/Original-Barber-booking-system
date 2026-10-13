import { SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <select ref={ref}
        className={cn('h-11 w-full rounded-lg border border-charcoal/20 bg-white px-3 text-sm outline-none focus:border-amber-500', className)}
        {...rest}>{children}</select>
    )
  }
)