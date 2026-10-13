import { ReactNode, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AccordionItem({ title, children, defaultOpen = false }:
  { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-charcoal/10">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="font-medium">{title}</span>
        <ChevronDown className={cn('h-5 w-5 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="pb-4 text-sm text-charcoal/80 leading-relaxed">{children}</div>}
    </div>
  )
}