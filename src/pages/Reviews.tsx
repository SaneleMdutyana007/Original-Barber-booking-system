import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import SEO from '@/components/SEO'
import Breadcrumbs from '@/components/Breadcrumbs'
import StarRating from '@/components/StarRating'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Review } from '@/lib/types'

export default function Reviews() {
  const { data } = useQuery({
    queryKey: ['public-reviews'],
    queryFn: async () => (await supabase.from('reviews').select('*, profiles(full_name)')
      .eq('is_published', true).order('created_at', { ascending: false })).data as Review[],
  })

  const avg = data?.length ? (data.reduce((s, r) => s + r.rating, 0) / data.length).toFixed(1) : '5.0'

  return (
    <div className="mx-auto max-w-content px-4 py-10">
      <SEO title="Verified Reviews | BarberShop ZA"
           description="Read verified reviews from real clients who booked and paid through BarberShop ZA."
           canonicalPath="/reviews" />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Reviews' }]} />
      <h1 className="text-4xl font-display mb-2">Verified Reviews</h1>
      <div className="mb-6 flex items-center gap-3">
        <StarRating value={Math.round(Number(avg))} />
        <span className="text-sm text-charcoal/70">{avg} average · {data?.length ?? 0} reviews</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(data ?? []).map((r) => (
          <Card key={r.id} className="p-5">
            <StarRating value={r.rating} />
            <p className="mt-3">“{r.comment}”</p>
            <p className="mt-3 text-xs text-charcoal/60">— {(r as any).profiles?.full_name ?? 'Verified client'}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Link to="/dashboard"><Button>Write a review</Button></Link>
      </div>
    </div>
  )
}