import { useEffect } from 'react'
import { useCookieConsent } from '@/contexts/CookieConsentContext'

export default function GoogleAnalytics() {
  const { consent } = useCookieConsent()
  const id = import.meta.env.VITE_GA_MEASUREMENT_ID

  useEffect(() => {
    if (consent !== 'accepted' || !id || document.getElementById('ga-script')) return
    const s = document.createElement('script')
    s.id = 'ga-script'
    s.async = true
    s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
    document.head.appendChild(s)
    // @ts-expect-error global
    window.dataLayer = window.dataLayer || []
    // @ts-expect-error global
    function gtag(...args: unknown[]) { window.dataLayer.push(args) }
    // @ts-expect-error global
    window.gtag = gtag
    gtag('js', new Date())
    gtag('config', id)
  }, [consent, id])

  return null
}