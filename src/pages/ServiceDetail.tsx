// ServiceDetail.tsx
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import SEO from '@/components/SEO'
import Breadcrumbs from '@/components/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { ZAR } from '@/lib/utils'
import { SITE } from '@/lib/constants'
import type { Service } from '@/lib/types'

export default function ServiceDetail() {
  const { slug } = useParams()
  const { data: s } = useQuery({
    queryKey: ['service', slug],
    enabled: !!slug,
    queryFn: async () => (await supabase.from('services').select('*').eq('slug', slug!).single()).data as Service,
  })
  const { data: related } = useQuery({
    queryKey: ['service-related', slug],
    enabled: !!slug,
    queryFn: async () => (await supabase.from('services').select('id,name,slug,price_zar,image_path,image_alt')
      .eq('is_active', true).neq('slug', slug!).limit(2)).data as Pick<Service, 'id'|'name'|'slug'|'price_zar'|'image_path'|'image_alt'>[],
  })

  if (!s) return <div className="mx-auto max-w-content px-4 py-10">Loading…</div>

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Service',
    name: s.name, description: s.description,
    provider: { '@type': 'HairSalon', name: SITE.name, url: SITE.url },
    offers: { '@type': 'Offer', price: s.price_zar.toFixed(2), priceCurrency: 'ZAR' },
  }

  return (
    <div className="mx-auto max-w-content px-4 py-10">
      <SEO title={`${s.name} in Cape Town | BarberShop ZA`}
           description={s.description.slice(0, 155)}
           canonicalPath={`/services/${s.slug}`} jsonLd={jsonLd} />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Services', to: '/services' }, { label: s.name }]} />

      <div className="grid gap-8 md:grid-cols-2 md:items-start">
        <div>
          <h1 className="text-4xl font-display">{s.name}</h1>
          <p className="mt-3 text-lg text-charcoal/70">{s.description}</p>
          <div className="mt-5 flex items-center gap-6 text-sm">
            <span><strong>{ZAR(s.price_zar)}</strong> · {s.duration_minutes} min</span>
          </div>
          <div className="mt-6 flex gap-3">
            <Link to={`/book?service=${s.id}`}><Button size="lg">Book this service</Button></Link>
          </div>
        </div>
        {s.image_path && (
          <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/service-images/${s.image_path}`}
               alt={s.image_alt} width="800" height="600" className="rounded-xl object-cover aspect-[4/3] w-full" />
        )}
      </div>

      {related?.length ? (
        <section className="mt-12">
          <h2 className="text-2xl font-display mb-4">You might also like</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {related.map((r) => (
              <Link key={r.id} to={`/services/${r.slug}`} className="rounded-lg border border-charcoal/10 p-4 hover:border-amber-500">
                <div className="font-medium">{r.name}</div>
                <div className="text-sm text-charcoal/60">{ZAR(r.price_zar)}</div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}