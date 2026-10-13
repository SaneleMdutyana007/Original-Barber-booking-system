import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { Barber, AvailabilitySlot } from '@/lib/types'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function AdminAvailability() {
  const qc = useQueryClient()
  const toast = useToast()
  const [barberId, setBarberId] = useState<string>('')

  const { data: barbers } = useQuery({
    queryKey: ['admin-barbers-simple'],
    queryFn: async () => (await supabase.from('barbers').select('id, display_name')).data as Pick<Barber, 'id' | 'display_name'>[],
  })

  const { data: slots } = useQuery({
    queryKey: ['admin-availability', barberId],
    enabled: !!barberId,
    queryFn: async () => (await supabase.from('availability_slots').select('*').eq('barber_id', barberId)).data as AvailabilitySlot[],
  })

  const [local, setLocal] = useState<AvailabilitySlot[]>([])
  useEffect(() => { if (slots) setLocal(slots) }, [slots])

  const upsert = async (day: number, start: string, end: string) => {
    if (!start || !end || !barberId) return
    const existing = local.find((s) => s.day_of_week === day)
    if (existing) {
      const { error } = await supabase.from('availability_slots').update({ start_time: start, end_time: end }).eq('id', existing.id)
      if (error) return toast.push(error.message, 'error')
    } else {
      const { error } = await supabase.from('availability_slots').insert({ barber_id: barberId, day_of_week: day, start_time: start, end_time: end })
      if (error) return toast.push(error.message, 'error')
    }
    toast.push('Saved.', 'success')
    qc.invalidateQueries({ queryKey: ['admin-availability', barberId] })
  }

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-display mb-4">Availability</h1>
      <label className="block mb-4 text-sm">
        Barber
        <select value={barberId} onChange={(e) => setBarberId(e.target.value)}
          className="ml-3 rounded-lg border border-charcoal/20 px-3 py-2">
          <option value="">Select…</option>
          {(barbers ?? []).map((b) => <option key={b.id} value={b.id}>{b.display_name}</option>)}
        </select>
      </label>

      {barberId && (
        <div className="grid gap-2">
          {DAYS.map((label, day) => {
            const s = local.find((x) => x.day_of_week === day)
            const [start, setStart] = useState(s?.start_time ?? '')
            const [end, setEnd] = useState(s?.end_time ?? '')
            return (
              <div key={day} className="flex flex-wrap items-center gap-3 rounded-lg border border-charcoal/10 p-3">
                <span className="w-12 font-medium">{label}</span>
                <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="rounded border border-charcoal/20 px-2 py-1" />
                <span>to</span>
                <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded border border-charcoal/20 px-2 py-1" />
                <Button size="sm" onClick={() => upsert(day, start, end)}>Save</Button>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}