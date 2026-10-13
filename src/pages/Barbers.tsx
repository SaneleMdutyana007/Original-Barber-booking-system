import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import SEO from '@/components/SEO'
import Breadcrumbs from '@/components/Breadcrumbs'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Barber } from '@/lib/types'

export default function Barbers() {
  const { data } = useQuery({
    queryKey: ['barbers'],
    queryFn: async () => (await supabase.from('barbers').select('*').eq('is_active', true)).data as Barber[],
  })
  return (
    <div className="mx-auto max-w-content px-4 py-10">
      <SEO title="Meet Our Barbers | BarberShop ZA"
           description="Meet the team: Thabo, Riaan, and Sipho. Ten years each behind the chair. Book your favourite barber online."
           canonicalPath="/barbers" />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Barbers' }]} />
      <h1 className="text-4xl font-display mb-6">Our Barbers</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {(data ?? []).map((b) => (
          <Card key={b.id} className="overflow-hidden">
            {b.photo_path && (
              <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/barber-photos/${b.photo_path}`}
                   alt={b.photo_alt} width="600" height="600" loading="lazy"
                   className="aspect-square w-full object-cover" />
            )}
            <div className="p-4">
              <h2 className="text-lg font-medium">{b.display_name}</h2>
              <p className="mt-1 text-sm text-charcoal/70">{b.bio}</p>
              <p className="mt-2 text-xs text-charcoal/60">{b.specialties.join(' • ')}</p>
              <div className="mt-3">
                <Link to={`/book?barber=${b.id}`}><Button size="sm">Book with {b.display_name.split(' ')[0]}</Button></Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}