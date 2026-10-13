import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import SEO from '@/components/SEO'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SITE, BUCKET } from '@/lib/constants'
import { toStorageUrl, ZAR } from '@/lib/utils'
import StarRating from '@/components/StarRating'
import type { Service, Review } from '@/lib/types'

export default function Home() {
  const { data: services } = useQuery({
    queryKey: ['home-services'],
    queryFn: async () => (await supabase.from('services').select('*').eq('is_active', true)
      .order('sort_order').limit(3)).data as Service[],
  })
  const { data: reviews } = useQuery({
    queryKey: ['home-reviews'],
    queryFn: async () => (await supabase.from('reviews').select('*, profiles(full_name)')
      .eq('is_published', true).order('created_at', { ascending: false }).limit(3)).data as Review[],
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    '@id': `${SITE.url}/#business`,
    name: SITE.name,
    url: SITE.url,
    telephone: SITE.phone,
    priceRange: 'R160–R380',
    image: `${SITE.url}/og-image.jpg`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lng },
    openingHoursSpecification: SITE.hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days, opens: h.opens, closes: h.closes,
    })),
    sameAs: [SITE.social.facebook, SITE.social.instagram],
    aggregateRating: {
      '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: `${reviews?.length ?? 120}`,
    },
  }

  return (
    <>
      <SEO
        title="Book a Barber in Cape Town | BarberShop ZA"
        description="Book your next haircut online in Cape Town. Real reviews, instant confirmation, secure PayFast payment in ZAR."
        canonicalPath="/"
        jsonLd={jsonLd}
      />

      {/* Above-the-fold hero with CTA */}
      <section className="mx-auto max-w-content px-4 pt-10 md:pt-16 pb-10">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-3 inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700">
              Cape Town CBD • Since 2012
            </p>
            <h1 className="text-4xl font-display leading-tight md:text-6xl">
              Fresh cuts, no queues. Book in under a minute.
            </h1>
            <p className="mt-4 text-lg text-charcoal/70">
              Choose your barber, pick a slot, pay securely with PayFast.
              Confirmation lands in seconds.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/book"><Button size="lg">Book Now</Button></Link>
              <Link to="/services"><Button size="lg" variant="outline">View Services</Button></Link>
            </div>
            <div className="mt-6 flex items-center gap-3 text-sm text-charcoal/70">
              <StarRating value={5} />
              <span>4.9 from verified clients</span>
            </div>
          </div>
          <div className="rounded-2xl bg-charcoal overflow-hidden aspect-[4/5] md:aspect-square" aria-hidden>
            {/* Replace with hero image — alt text required */}
          </div>
        </div>
      </section>

      {/* Services preview */}
      <section className="mx-auto max-w-content px-4 py-12">
        <h2 className="text-3xl font-display mb-6">Popular Services</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {(services ?? []).map((s) => (
            <Card key={s.id} className="overflow-hidden">
              <div className="aspect-[4/3] bg-charcoal/5" />
              <div className="p-4">
                <h3 className="text-lg font-medium">{s.name}</h3>
                <p className="mt-1 text-sm text-charcoal/70 line-clamp-2">{s.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-medium">{ZAR(s.price_zar)}</span>
                  <Link to={`/services/${s.slug}`} className="text-sm text-amber-500">View →</Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Reviews strip */}
      <section className="mx-auto max-w-content px-4 py-12">
        <h2 className="text-3xl font-display mb-6">Verified Reviews</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {(reviews ?? []).map((r) => (
            <Card key={r.id} className="p-5">
              <StarRating value={r.rating} />
              <p className="mt-3 text-sm">“{r.comment}”</p>
              <p className="mt-3 text-xs text-charcoal/60">— {(r as any).profiles?.full_name ?? 'Verified client'}</p>
            </Card>
          ))}
        </div>
        <div className="mt-6">
          <Link to="/reviews" className="text-amber-500">Read all reviews →</Link>
        </div>
      </section>

      {/* Map */}
      <section className="mx-auto max-w-content px-4 py-12">
        <h2 className="text-3xl font-display mb-6">Find Us</h2>
        <div className="overflow-hidden rounded-xl border border-charcoal/10">
          <iframe
            title="BarberShop ZA location"
            src={`https://www.google.com/maps?q=${SITE.geo.lat},${SITE.geo.lng}&output=embed`}
            width="100%" height="360" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
        <div className="mt-4">
          <a className="text-amber-500 underline"
             href={`https://www.google.com/maps/dir/?api=1&destination=${SITE.geo.lat},${SITE.geo.lng}`}
             target="_blank" rel="noopener noreferrer">Get Directions →</a>
        </div>
      </section>
    </>
  )
}