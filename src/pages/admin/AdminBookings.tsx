import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { useToast } from '@/components/ui/Toast'
import { formatSlot, ZAR } from '@/lib/utils'
import type { Booking, BookingStatus } from '@/lib/types'

export default function AdminBookings() {
  const qc = useQueryClient()
  const toast = useToast()
  const [status, setStatus] = useState<BookingStatus | ''>('')
  const [q, setQ] = useState('')
  const [rejectFor, setRejectFor] = useState<Booking | null>(null)
  const [reason, setReason] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', status],
    queryFn: async () => {
      let query = supabase.from('bookings')
        .select('*, services(name), barbers(display_name), profiles:client_id(full_name, phone)')
        .order('slot_start', { ascending: false }).limit(200)
      if (status) query = query.eq('status', status)
      return (await query).data as Booking[]
    },
  })

  const filtered = (data ?? []).filter((b) => {
    if (!q) return true
    const name = (b as any).profiles?.full_name?.toLowerCase() ?? ''
    const phone = (b as any).profiles?.phone ?? ''
    return name.includes(q.toLowerCase()) || phone.includes(q)
  })

  const setBookingStatus = async (b: Booking, s: BookingStatus) => {
    const { error } = await supabase.rpc('admin_set_booking_status', { p_booking_id: b.id, p_new_status: s })
    if (error) return toast.push(error.message, 'error')
    toast.push(`Booking ${s}.`, 'success')
    qc.invalidateQueries({ queryKey: ['admin-bookings'] })
  }

  const refundIfPaid = async (b: Booking) => {
    if (b.payment_status !== 'paid') return
    const { data: { session } } = await supabase.auth.getSession()
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payfast-refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ booking_id: b.id, reason }),
    })
  }

  const doReject = async () => {
    if (!rejectFor) return
    await refundIfPaid(rejectFor)
    await setBookingStatus(rejectFor, 'cancelled')
    setRejectFor(null); setReason('')
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-display">Bookings</h1>
        <div className="flex gap-2">
          <Input placeholder="Search name or phone…" value={q} onChange={(e) => setQ(e.target.value)} className="w-56" />
          <select value={status} onChange={(e) => setStatus(e.target.value as any)}
            className="rounded-lg border border-charcoal/20 px-3 text-sm">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="reschedule_requested">Reschedule requested</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {isLoading ? <p>Loading…</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/10 text-left">
                <th className="py-2 pr-3">Client</th>
                <th className="py-2 pr-3">Barber</th>
                <th className="py-2 pr-3">Service</th>
                <th className="py-2 pr-3">When</th>
                <th className="py-2 pr-3">Amount</th>
                <th className="py-2 pr-3">Payment</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b border-charcoal/5">
                  <td className="py-3 pr-3">{(b as any).profiles?.full_name}<div className="text-xs text-charcoal/50">{(b as any).profiles?.phone}</div></td>
                  <td className="py-3 pr-3">{(b as any).barbers?.display_name}</td>
                  <td className="py-3 pr-3">{(b as any).services?.name}</td>
                  <td className="py-3 pr-3">{formatSlot(b.slot_start)}</td>
                  <td className="py-3 pr-3">{ZAR(b.amount_zar)}</td>
                  <td className="py-3 pr-3"><Badge tone={b.payment_status === 'paid' ? 'success' : b.payment_status === 'refunded' ? 'neutral' : 'warning'}>{b.payment_status}</Badge></td>
                  <td className="py-3 pr-3"><Badge tone={b.status === 'confirmed' ? 'success' : b.status === 'cancelled' ? 'danger' : 'info'}>{b.status.replace('_',' ')}</Badge></td>
                  <td className="py-3 pr-3 space-x-2">
                    {b.status === 'pending' && <button className="text-green-700 underline" onClick={() => setBookingStatus(b, 'confirmed')}>Accept</button>}
                    {(b.status === 'pending' || b.status === 'confirmed') && <button className="text-red-600 underline" onClick={() => setRejectFor(b)}>Reject</button>}
                    {b.status === 'confirmed' && <button className="text-red-600 underline" onClick={() => setRejectFor(b)}>Cancel</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!rejectFor} onClose={() => setRejectFor(null)} title="Reject booking">
        <p className="text-sm text-charcoal/70 mb-3">
          Client will be notified. If payment was taken, a refund will be initiated via PayFast.
        </p>
        <Label htmlFor="r-reason">Reason</Label>
        <Textarea id="r-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="mt-4 flex gap-2">
          <Button variant="danger" onClick={doReject}>Confirm reject</Button>
          <Button variant="outline" onClick={() => setRejectFor(null)}>Cancel</Button>
        </div>
      </Dialog>
    </Card>
  )
}