import { createContext, ReactNode, useCallback, useContext, useState } from 'react'
import { cn } from '@/lib/utils'

type Toast = { id: number; message: string; tone: 'info' | 'success' | 'error' }
const Ctx = createContext<{ push: (msg: string, tone?: Toast['tone']) => void } | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((message: string, tone: Toast['tone'] = 'info') => {
    const id = Date.now()
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])
  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-24 right-4 z-[300] flex flex-col gap-2 md:bottom-6">
        {toasts.map((t) => (
          <div key={t.id} role="status"
            className={cn('rounded-lg px-4 py-3 text-sm shadow-lg text-white',
              t.tone === 'success' && 'bg-green-700',
              t.tone === 'error' && 'bg-red-700',
              t.tone === 'info' && 'bg-charcoal')}>
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useToast must be inside ToastProvider')
  return v
}