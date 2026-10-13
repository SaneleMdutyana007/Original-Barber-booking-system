import { useCookieConsent } from '@/contexts/CookieConsentContext'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'

export default function CookieBanner() {
  const { consent, accept, reject } = useCookieConsent()
  if (consent) return null
  return (
    <div role="dialog" aria-label="Cookie consent"
      className="fixed bottom-20 left-4 right-4 z-[300] rounded-xl border border-charcoal/10 bg-white p-4 shadow-lg md:bottom-4 md:left-auto md:right-4 md:max-w-md">
      <p className="mb-3 text-sm">
        We use cookies to measure site performance and improve your booking experience.
        See our <Link className="text-amber-500 underline" to="/privacy-policy">Privacy Policy</Link>.
      </p>
      <div className="flex gap-2">
        <Button size="sm" onClick={accept}>Accept</Button>
        <Button size="sm" variant="outline" onClick={reject}>Reject</Button>
      </div>
    </div>
  )
}