import { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    return <textarea ref={ref} className={cn('w-full rounded-lg border border-charcoal/20 bg-white p-3 text-sm outline-none focus:border-amber-500', className)} {...rest} />
  }
)