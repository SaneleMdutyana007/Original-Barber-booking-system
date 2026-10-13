import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function StarRating({ value, size = 16, onChange }:
  { value: number; size?: number; onChange?: (v: number) => void }) {
  return (
    <div role={onChange ? 'radiogroup' : 'img'} aria-label={`${value} out of 5 stars`} className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" disabled={!onChange}
          onClick={() => onChange?.(n)} className={cn('p-0.5', !onChange && 'cursor-default')}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}>
          <Star width={size} height={size}
            className={cn(n <= value ? 'fill-amber-500 text-amber-500' : 'text-charcoal/30')} />
        </button>
      ))}
    </div>
  )
}