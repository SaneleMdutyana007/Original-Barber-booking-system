import { Link, NavLink } from 'react-router-dom'
import { LogIn, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default function SiteHeader() {
  const { user, role, signOut } = useAuth()
  const nav = [
    { to: '/services', label: 'Services' },
    { to: '/barbers', label: 'Barbers' },
    { to: '/case-studies', label: 'Stories' },
    { to: '/faqs', label: 'FAQs' },
    { to: '/contact', label: 'Contact' },
  ]
  return (
    <header className="sticky top-0 z-50 border-b border-charcoal/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-display">
          <span aria-hidden>✂️</span> BarberShop ZA
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to}
              className={({ isActive }) => cn('text-sm font-medium hover:text-amber-500', isActive && 'text-amber-500')}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to={role === 'admin' ? '/admin' : '/dashboard'} className="hidden md:flex items-center gap-1 text-sm">
                <User className="h-4 w-4" /> {role === 'admin' ? 'Admin' : 'Dashboard'}
              </Link>
              <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
            </>
          ) : (
            <Link to="/login" className="hidden md:flex items-center gap-1 text-sm">
              <LogIn className="h-4 w-4" /> Log in
            </Link>
          )}
          <Link to="/book"><Button size="sm">Book Now</Button></Link>
        </div>
      </div>
    </header>
  )
}