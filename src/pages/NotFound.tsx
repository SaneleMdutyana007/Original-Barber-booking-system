import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import SEO from '@/components/SEO'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SITE } from '@/lib/constants'

export default function NotFound() {
  const [q, setQ] = useState('')
  const { data: services } = useQuery({
    queryKey: ['404-services'],
    queryFn: async () => (await supabase.from('services').select('slug,name').eq('is_active', true)).data as { slug: string; name: string }[],
  })
  const { data: cases } = useQuery({
    queryKey: ['404-cases'],
    queryFn: async () => (await supabase.from('case_studies').select('slug,title').eq('published', true)).data as { slug: string; title: string }[],
  })

  const results = q.length > 1
    ? [
        ...(services ?? []).filter((s) => s.name.toLowerCase().includes(q.toLowerCase())).map((s) => ({ type: 'Service', to: `/services/${s.slug}`, label: s.name })),
        ...(cases ?? []).filter((c) => c.title.toLowerCase().includes(q.toLowerCase())).map((c) => ({ type: 'Story', to: `/case-studies/${c.slug}`, label: c.title })),
      ]
    : []

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'HairSalon',
    name: SITE.name, url: SITE.url, telephone: SITE.phone,
    address: { '@type': 'PostalAddress', streetAddress: SITE.address.street,
      addressLocality: SITE.address.locality, addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode, addressCountry: SITE.address.country },
  }

  return (
    <div className="mx-auto max-w-content px-4 py-20 text-center">
      <SEO title="Page Not Found | BarberShop ZA"
           description="The page you're looking for doesn't exist. Return to booking or browse our services."
           noindex jsonLd={jsonLd} />
      <h1 className="text-6xl font-display mb-2">404</h1>
      <p className="text-xl text-charcoal/70 mb-8">Looks like this page got a bad haircut.</p>

      <div className="mx-auto max-w-md mb-8">
        <Input placeholder="Search services or stories…" value={q} onChange={(e) => setQ(e.target.value)} />
        {results.length > 0 && (
          <ul className="mt-3 rounded-lg border border-charcoal/10 bg-white text-left">
            {results.map((r) => (
              <li key={r.to} className="border-b border-charcoal/5 last:border-0">
                <Link to={r.to} className="block px-4 py-2 text-sm hover:bg-charcoal/5">
                  <span className="text-xs text-charcoal/50">{r.type}</span> — {r.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/"><Button variant="outline">Home</Button></Link>
        <Link to="/services"><Button variant="outline">Services</Button></Link>
        <Link to="/book"><Button>Book Now</Button></Link>
        <Link to="/faqs"><Button variant="outline">FAQs</Button></Link>
      </div>
    </div>
  )
}