import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', className, ...rest }, ref
) {
  const base = 'inline-flex items-center justify-center rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed'
  const variants: Record<Variant, string> = {
    primary: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm',
    outline: 'border border-charcoal/20 hover:border-charcoal text-charcoal bg-white',
    ghost: 'hover:bg-charcoal/5 text-charcoal',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  }
  const sizes: Record<Size, string> = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-5 text-sm',
    lg: 'h-13 px-6 text-base',
  }
  return <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...rest} />
})