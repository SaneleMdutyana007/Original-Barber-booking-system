import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { formatSlot } from '@/lib/utils'
import type { BookingRequest } from '@/lib/types'

export default function AdminRequests() {
  const qc = useQueryClient()
  const toast = useToast()

  const { data } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: async () => (await supabase.from('booking_requests')
      .select('*, bookings!inner(*, services(name), profiles:client_id(full_name))')
      .eq('status', 'pending').order('created_at')).data as BookingRequest[],
  })

  const decide = async (id: string, approve: boolean) => {
    const { error } = await supabase.rpc('approve_reschedule_request', { p_request_id: id, p_approve: approve })
    if (error) return toast.push(error.message, 'error')
    toast.push(approve ? 'Approved.' : 'Rejected.', 'success')
    qc.invalidateQueries({ queryKey: ['admin-requests'] })
    qc.invalidateQueries({ queryKey: ['admin-bookings'] })
  }

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-display mb-4">Pending Requests</h1>
      {!data?.length ? <p className="text-sm text-charcoal/60">No pending requests.</p> : (
        <div className="grid gap-3">
          {data.map((r) => (
            <div key={r.id} className="rounded-lg border border-charcoal/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{(r as any).bookings?.profiles?.full_name} — {r.request_type}</div>
                  <div className="text-sm text-charcoal/70">
                    Current: {formatSlot((r as any).bookings?.slot_start)} — {(r as any).bookings?.services?.name}
                  </div>
                  {r.request_type === 'reschedule' && r.requested_slot_start && (
                    <div className="text-sm mt-1">Requested: <strong>{formatSlot(r.requested_slot_start)}</strong></div>
                  )}
                  {r.reason && <p className="text-sm mt-2 text-charcoal/70">“{r.reason}”</p>}
                </div>
                <Badge tone={r.request_type === 'cancel' ? 'danger' : 'warning'}>{r.request_type}</Badge>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => decide(r.id, true)}>Approve</Button>
                <Button size="sm" variant="outline" onClick={() => decide(r.id, false)}>Reject</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}