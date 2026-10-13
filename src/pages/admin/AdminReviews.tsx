import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import StarRating from '@/components/StarRating'
import { useToast } from '@/components/ui/Toast'
import type { Review } from '@/lib/types'

export default function AdminReviews() {
  const qc = useQueryClient()
  const toast = useToast()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => (await supabase.from('reviews').select('*, profiles(full_name)').order('created_at', { ascending: false })).data as Review[],
  })

  const toggle = async (r: Review) => {
    const { error } = await supabase.from('reviews').update({ is_published: !r.is_published }).eq('id', r.id)
    if (error) return toast.push(error.message, 'error')
    qc.invalidateQueries({ queryKey: ['admin-reviews'] })
  }

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-display mb-4">Reviews</h1>
      {isLoading ? <p>Loading…</p> : (
        <div className="grid gap-3">
          {(data ?? []).map((r) => (
            <div key={r.id} className="rounded-lg border border-charcoal/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <StarRating value={r.rating} />
                  <p className="mt-2">“{r.comment}”</p>
                  <p className="mt-2 text-xs text-charcoal/60">{(r as any).profiles?.full_name}</p>
                </div>
                <Badge tone={r.is_published ? 'success' : 'warning'}>{r.is_published ? 'Published' : 'Pending'}</Badge>
              </div>
              <div className="mt-3">
                <Button size="sm" variant="outline" onClick={() => toggle(r)}>{r.is_published ? 'Unpublish' : 'Publish'}</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}