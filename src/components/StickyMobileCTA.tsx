import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export default function StickyMobileCTA() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/book') || pathname.startsWith('/thank-you') ||
      pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) return null
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-charcoal/10 bg-white/95 p-3 backdrop-blur md:hidden">
      <Link to="/book"><Button className="w-full" size="lg">Book Now</Button></Link>
    </div>
  )
}