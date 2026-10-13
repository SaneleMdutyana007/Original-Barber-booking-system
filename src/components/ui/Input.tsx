import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return (
      <input ref={ref}
        className={cn('h-11 w-full rounded-lg border border-charcoal/20 bg-white px-3 text-sm outline-none focus:border-amber-500', className)}
        {...rest} />
    )
  }
)