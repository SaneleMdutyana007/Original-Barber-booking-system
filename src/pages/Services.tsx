// Services.tsx
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import SEO from '@/components/SEO'
import Breadcrumbs from '@/components/Breadcrumbs'
import { Card } from '@/components/ui/Card'
import { ZAR } from '@/lib/utils'
import type { Service } from '@/lib/types'

export default function Services() {
  const { data, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => (await supabase.from('services').select('*').eq('is_active', true).order('sort_order')).data as Service[],
  })
  return (
    <div className="mx-auto max-w-content px-4 py-10">
      <SEO title="Haircut & Grooming Services | BarberShop ZA"
           description="Browse our full grooming menu: fades, beard trims, hot towel shaves. Transparent South African Rand pricing."
           canonicalPath="/services" />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Services' }]} />
      <h1 className="text-4xl font-display mb-6">Services</h1>
      {isLoading ? <p>Loading…</p> : (
        <div className="grid gap-4 md:grid-cols-3">
          {(data ?? []).map((s) => (
            <Card key={s.id} className="overflow-hidden">
              {s.image_path && (
                <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/service-images/${s.image_path}`}
                     alt={s.image_alt} width="600" height="450" loading="lazy" className="aspect-[4/3] w-full object-cover" />
              )}
              <div className="p-4">
                <h2 className="text-lg font-medium">{s.name}</h2>
                <p className="mt-1 text-sm text-charcoal/70">{s.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-medium">{ZAR(s.price_zar)}</span>
                  <Link to={`/services/${s.slug}`} className="text-sm text-amber-500">Details →</Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}