import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

export function Dialog({ open, onClose, title, children }:
  { open: boolean; onClose: () => void; title: string; children: ReactNode }) {

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div role="dialog" aria-modal="true" aria-label={title}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-display">{title}</h3>
          <button aria-label="Close" onClick={onClose} className="p-1 rounded hover:bg-charcoal/5">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}