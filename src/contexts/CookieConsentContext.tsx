import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Choice = 'accepted' | 'rejected' | null
interface Ctx { consent: Choice; accept: () => void; reject: () => void }
const C = createContext<Ctx | undefined>(undefined)

const KEY = 'barbershop-za-consent'

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<Choice>(null)
  useEffect(() => {
    const stored = localStorage.getItem(KEY) as Choice | null
    if (stored) setConsent(stored)
  }, [])
  const accept = () => { localStorage.setItem(KEY, 'accepted'); setConsent('accepted') }
  const reject = () => { localStorage.setItem(KEY, 'rejected'); setConsent('rejected') }
  return <C.Provider value={{ consent, accept, reject }}>{children}</C.Provider>
}

export function useCookieConsent() {
  const v = useContext(C)
  if (!v) throw new Error('useCookieConsent must be inside CookieConsentProvider')
  return v
}