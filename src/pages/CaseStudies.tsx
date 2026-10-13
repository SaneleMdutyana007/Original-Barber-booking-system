// CaseStudies.tsx
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import SEO from '@/components/SEO'
import Breadcrumbs from '@/components/Breadcrumbs'
import { Card } from '@/components/ui/Card'
import type { CaseStudy } from '@/lib/types'

export default function CaseStudies() {
  const { data } = useQuery({
    queryKey: ['cases'],
    queryFn: async () => (await supabase.from('case_studies').select('*').eq('published', true).order('sort_order')).data as CaseStudy[],
  })
  return (
    <div className="mx-auto max-w-content px-4 py-10">
      <SEO title="Client Stories | BarberShop ZA"
           description="Real clients, real transformations. Read how local Cape Town clients found their look with us."
           canonicalPath="/case-studies" />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Client Stories' }]} />
      <h1 className="text-4xl font-display mb-6">Client Stories</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {(data ?? []).map((c) => (
          <Card key={c.id} className="overflow-hidden">
            {c.image_path && (
              <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/case-study-images/${c.image_path}`}
                   alt={c.image_alt} width="600" height="450" loading="lazy"
                   className="aspect-[4/3] w-full object-cover" />
            )}
            <div className="p-4">
              <h2 className="text-lg font-medium">{c.title}</h2>
              <p className="mt-1 text-sm text-charcoal/70">{c.summary}</p>
              <Link to={`/case-studies/${c.slug}`} className="mt-3 inline-block text-sm text-amber-500">Read story →</Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}