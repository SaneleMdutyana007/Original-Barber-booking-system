// CaseStudyDetail.tsx
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import SEO from '@/components/SEO'
import Breadcrumbs from '@/components/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import type { CaseStudy, Service } from '@/lib/types'

export default function CaseStudyDetail() {
  const { slug } = useParams()
  const { data: c } = useQuery({
    queryKey: ['case', slug],
    enabled: !!slug,
    queryFn: async () => (await supabase.from('case_studies').select('*').eq('slug', slug!).single()).data as CaseStudy,
  })
  const { data: service } = useQuery({
    queryKey: ['case-service', c?.service_id],
    enabled: !!c?.service_id,
    queryFn: async () => (await supabase.from('services').select('*').eq('id', c!.service_id!).single()).data as Service,
  })
  if (!c) return <div className="mx-auto max-w-content px-4 py-10">Loading…</div>

  return (
    <div className="mx-auto max-w-content px-4 py-10">
      <SEO title={`${c.title} | BarberShop ZA`}
           description={c.summary.slice(0, 155)} canonicalPath={`/case-studies/${c.slug}`} />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Client Stories', to: '/case-studies' }, { label: c.title }]} />
      <article className="prose max-w-2xl">
        <h1 className="text-4xl font-display">{c.title}</h1>
        <p className="text-sm text-charcoal/60">Client: {c.client_name}</p>
        {c.image_path && (
          <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/case-study-images/${c.image_path}`}
               alt={c.image_alt} width="800" height="600" className="mt-4 rounded-xl aspect-[4/3] w-full object-cover" />
        )}
        <div className="mt-4" dangerouslySetInnerHTML={{ __html: c.body_html }} />

        {service && (
          <p className="mt-6">
            Liked this look? <Link to={`/services/${service.slug}`} className="text-amber-500 underline">{service.name}</Link>{' '}
            · <Link to={`/book?service=${service.id}`} className="text-amber-500 underline">Book this service</Link>
          </p>
        )}

        <div className="mt-8">
          <Link to="/book"><Button size="lg">Book your transformation</Button></Link>
        </div>
      </article>
    </div>
  )
}