import { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Calendar, ClipboardList, Scissors, UserSquare, Clock, Star, BookOpen, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { to: '/admin',              label: 'Bookings',    icon: ClipboardList, end: true },
  { to: '/admin/calendar',     label: 'Calendar',    icon: Calendar },
  { to: '/admin/requests',     label: 'Requests',    icon: Clock },
  { to: '/admin/services',     label: 'Services',    icon: Scissors },
  { to: '/admin/barbers',      label: 'Barbers',     icon: UserSquare },
  { to: '/admin/availability', label: 'Availability', icon: Calendar },
  { to: '/admin/reviews',      label: 'Reviews',     icon: Star },
  { to: '/admin/case-studies', label: 'Case Studies', icon: BookOpen },
  { to: '/admin/faqs',         label: 'FAQs',        icon: HelpCircle },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-content gap-6 px-4 py-8 md:grid-cols-[220px_1fr]">
      <aside>
        <nav className="space-y-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
                isActive ? 'bg-charcoal text-white' : 'hover:bg-charcoal/5'
              )}>
              <l.icon className="h-4 w-4" /> {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main>{children}</main>
    </div>
  )
}