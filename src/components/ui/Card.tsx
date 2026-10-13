import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-xl border border-charcoal/10 bg-white shadow-sm', className)} {...rest} />
}