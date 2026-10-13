import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import SEO from '@/components/SEO'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import StarRating from '@/components/StarRating'
import { useToast } from '@/components/ui/Toast'
import { formatSlot, ZAR } from '@/lib/utils'
import type { Booking } from '@/lib/types'

export default function Dashboard() {
  const qc = useQueryClient()
  const toast = useToast()
  const [cancelFor, setCancelFor] = useState<Booking | null>(null)
  const [rescheduleFor, setRescheduleFor] = useState<Booking | null>(null)
  const [reviewFor, setReviewFor] = useState<Booking | null>(null)
  const [reason, setReason] = useState('')
  const [newSlot, setNewSlot] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => (await supabase.from('bookings')
      .select('*, services(name), barbers(display_name)')
      .order('slot_start', { ascending: false })).data as Booking[],
  })

  const { data: reviews } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: async () => (await supabase.from('reviews').select('booking_id')).data as { booking_id: string }[],
  })

  const reviewed = new Set((reviews ?? []).map((r) => r.booking_id))

  const submitCancel = async () => {
    if (!cancelFor) return
    const { error } = await supabase.rpc('request_booking_cancellation', { p_booking_id: cancelFor.id, p_reason: reason })
    if (error) return toast.push(error.message, 'error')
    toast.push('Cancellation request submitted. We respond within 1 hour.', 'success')
    setCancelFor(null); setReason(''); qc.invalidateQueries({ queryKey: ['my-bookings'] })
  }

  const submitReschedule = async () => {
    if (!rescheduleFor || !newSlot) return
    const iso = new Date(newSlot).toISOString()
    const { error } = await supabase.rpc('request_booking_reschedule', {
      p_booking_id: rescheduleFor.id, p_new_slot_start: iso, p_reason: reason,
    })
    if (error) return toast.push(error.message, 'error')
    toast.push('Reschedule request submitted. We respond within 1 hour.', 'success')
    setRescheduleFor(null); setNewSlot(''); setReason(''); qc.invalidateQueries({ queryKey: ['my-bookings'] })
  }

  const submitReview = async () => {
    if (!reviewFor) return
    const { error } = await supabase.from('reviews').insert({
      booking_id: reviewFor.id, client_id: (await supabase.auth.getUser()).data.user!.id,
      rating, comment,
    })
    if (error) return toast.push(error.message, 'error')
    toast.push('Thanks for your review!', 'success')
    setReviewFor(null); setComment(''); setRating(5); qc.invalidateQueries({ queryKey: ['my-reviews'] })
  }

  return (
    <div className="mx-auto max-w-content px-4 py-10">
      <SEO title="Your Dashboard | BarberShop ZA" description="Manage your bookings, reviews, and loyalty." canonicalPath="/dashboard" noindex />
      <h1 className="text-4xl font-display mb-6">Your bookings</h1>

      {isLoading ? <p>Loading…</p> : (bookings ?? []).length === 0 ? (
        <Card className="p-6">No bookings yet. <a className="text-amber-500 underline" href="/book">Book your first visit →</a></Card>
      ) : (
        <div className="grid gap-4">
          {bookings!.map((b) => {
            const isPast = new Date(b.slot_end) < new Date()
            const canReview = isPast && b.status === 'confirmed' && b.payment_status === 'paid' && !reviewed.has(b.id)
            return (
              <Card key={b.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{(b as any).services?.name}</div>
                    <div className="text-sm text-charcoal/70">
                      {(b as any).barbers?.display_name} · {formatSlot(b.slot_start)}
                    </div>
                    <div className="mt-1 text-sm">{ZAR(b.amount_zar)}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : b.status === 'cancelled' ? 'danger' : 'info'}>{b.status.replace('_',' ')}</Badge>
                    <Badge tone={b.payment_status === 'paid' ? 'success' : b.payment_status === 'refunded' ? 'neutral' : 'warning'}>{b.payment_status}</Badge>
                  </div>
                </div>

                {!isPast && b.status !== 'cancelled' && b.status !== 'reschedule_requested' && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setRescheduleFor(b)}>Request Reschedule</Button>
                    <Button size="sm" variant="ghost" onClick={() => setCancelFor(b)}>Request Cancellation</Button>
                  </div>
                )}
                {canReview && (
                  <div className="mt-4">
                    <Button size="sm" onClick={() => setReviewFor(b)}>Leave a Review</Button>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={!!cancelFor} onClose={() => setCancelFor(null)} title="Request cancellation">
        <p className="text-sm text-charcoal/70 mb-3">
          Cancellations more than 24 hours before the appointment are fully refunded. Inside 24 hours we retain 50%.
        </p>
        <Label htmlFor="cancel-reason">Reason (optional)</Label>
        <Textarea id="cancel-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="mt-4 flex gap-2">
          <Button onClick={submitCancel}>Submit request</Button>
          <Button variant="outline" onClick={() => setCancelFor(null)}>Cancel</Button>
        </div>
      </Dialog>

      <Dialog open={!!rescheduleFor} onClose={() => setRescheduleFor(null)} title="Request reschedule">
        <Label htmlFor="new-slot">New date & time</Label>
        <Input id="new-slot" type="datetime-local" value={newSlot} onChange={(e) => setNewSlot(e.target.value)} />
        <div className="mt-3">
          <Label htmlFor="resched-reason">Reason (optional)</Label>
          <Textarea id="resched-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={submitReschedule}>Submit request</Button>
          <Button variant="outline" onClick={() => setRescheduleFor(null)}>Cancel</Button>
        </div>
      </Dialog>

      <Dialog open={!!reviewFor} onClose={() => setReviewFor(null)} title="Leave a review">
        <Label>Rating</Label>
        <StarRating value={rating} onChange={setRating} size={28} />
        <div className="mt-3">
          <Label htmlFor="review-comment">Comment</Label>
          <Textarea id="review-comment" rows={4} value={comment} onChange={(e) => setComment(e.target.value)} />
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={submitReview}>Submit</Button>
          <Button variant="outline" onClick={() => setReviewFor(null)}>Cancel</Button>
        </div>
      </Dialog>
    </div>
  )
}