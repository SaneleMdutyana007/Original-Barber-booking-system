import { useState } from 'react'
import SEO from '@/components/SEO'
import Breadcrumbs from '@/components/Breadcrumbs'
import ResponsePromiseBanner from '@/components/ResponsePromiseBanner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { SITE } from '@/lib/constants'
import { useToast } from '@/components/ui/Toast'

export default function Contact() {
  const [values, setValues] = useState({ name: '', email: '', message: '' })
  const toast = useToast()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    // Wire to an email service (Resend / Postmark) or a Supabase Edge Function.
    console.log('contact form', values)
    toast.push('Thanks! We respond within 2 business hours.', 'success')
    setValues({ name: '', email: '', message: '' })
  }

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'HairSalon',
    name: SITE.name, url: SITE.url, telephone: SITE.phone,
    address: { '@type': 'PostalAddress', streetAddress: SITE.address.street,
      addressLocality: SITE.address.locality, addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode, addressCountry: SITE.address.country },
    geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lng },
    openingHoursSpecification: SITE.hours.map((h) => ({
      '@type': 'OpeningHoursSpecification', dayOfWeek: h.days, opens: h.opens, closes: h.closes,
    })),
  }

  return (
    <div className="mx-auto max-w-content px-4 py-10">
      <SEO title="Contact & Directions | BarberShop ZA"
           description="Find us in Cape Town CBD. Get directions, opening hours, and our 2-hour response promise."
           canonicalPath="/contact" jsonLd={jsonLd} />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Contact' }]} />
      <h1 className="text-4xl font-display mb-4">Contact & Directions</h1>
      <div className="mb-6 max-w-2xl"><ResponsePromiseBanner /></div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-display mb-3">Send us a message</h2>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label htmlFor="c-name">Name</Label>
              <Input id="c-name" required value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="c-email">Email</Label>
              <Input id="c-email" type="email" required value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="c-message">Message</Label>
              <Textarea id="c-message" rows={5} required value={values.message} onChange={(e) => setValues({ ...values, message: e.target.value })} />
            </div>
            <Button type="submit">Send message</Button>
          </form>

          <div className="mt-6 border-t border-charcoal/10 pt-6 text-sm">
            <address className="not-italic">
              <div className="font-medium">{SITE.name}</div>
              <div>{SITE.address.street}</div>
              <div>{SITE.address.locality}, {SITE.address.postalCode}</div>
              <div className="mt-2"><a className="text-amber-500 underline" href={`tel:${SITE.phone.replace(/\s/g,'')}`}>{SITE.phone}</a></div>
              <div><a className="text-amber-500 underline" href={`mailto:${SITE.email}`}>{SITE.email}</a></div>
            </address>
            <ul className="mt-3 space-y-1 text-charcoal/70">
              <li>Mon–Fri: 08:00–18:00</li>
              <li>Sat: 08:00–14:00</li>
              <li>Sun: Closed</li>
            </ul>
          </div>
        </Card>

        <div>
          <div className="overflow-hidden rounded-xl border border-charcoal/10">
            <iframe title="Map to BarberShop ZA"
              src={`https://www.google.com/maps?q=${SITE.geo.lat},${SITE.geo.lng}&output=embed`}
              width="100%" height="420" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
          <div className="mt-4">
            <a className="inline-flex items-center gap-2 text-amber-500 underline"
               href={`https://www.google.com/maps/dir/?api=1&destination=${SITE.geo.lat},${SITE.geo.lng}`}
               target="_blank" rel="noopener noreferrer">
              Get Directions →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}