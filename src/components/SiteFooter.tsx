import { Link } from 'react-router-dom'
import { SITE } from '@/lib/constants'

export default function SiteFooter() {
  return (
    <footer className="border-t border-charcoal/10 bg-white mt-16">
      <div className="mx-auto max-w-content grid gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="text-lg font-display mb-3">✂️ BarberShop ZA</div>
          <p className="text-sm text-charcoal/70">
            Premium grooming in Cape Town CBD. Book online, pay securely in ZAR, walk out sharp.
          </p>
        </div>
        <div>
          <h4 className="font-medium mb-3">Shop</h4>
          <ul className="space-y-2 text-sm text-charcoal/70">
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/barbers">Barbers</Link></li>
            <li><Link to="/book">Book Now</Link></li>
            <li><Link to="/reviews">Reviews</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-charcoal/70">
            <li><Link to="/case-studies">Client Stories</Link></li>
            <li><Link to="/faqs">FAQs</Link></li>
            <li><Link to="/contact">Contact & Directions</Link></li>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-3">Visit</h4>
          <address className="not-italic text-sm text-charcoal/70 space-y-1">
            <div>{SITE.address.street}</div>
            <div>{SITE.address.locality}, {SITE.address.postalCode}</div>
            <div><a href={`tel:${SITE.phone.replace(/\s/g,'')}`}>{SITE.phone}</a></div>
            <div><a href={`mailto:${SITE.email}`}>{SITE.email}</a></div>
          </address>
        </div>
      </div>
      <div className="border-t border-charcoal/10 py-4 text-center text-xs text-charcoal/60">
        © {new Date().getFullYear()} BarberShop ZA. All rights reserved.
      </div>
    </footer>
  )
}