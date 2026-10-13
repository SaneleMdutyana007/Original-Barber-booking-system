import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { addDays, format, startOfWeek } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Booking } from '@/lib/types'

export default function AdminCalendar() {
  const [weekOffset, setWeekOffset] = useState(0)
  const weekStart = startOfWeek(addDays(new Date(), weekOffset * 7), { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const { data: bookings } = useQuery({
    queryKey: ['admin-calendar', format(weekStart, 'yyyy-MM-dd')],
    queryFn: async () => {
      const start = days[0].toISOString()
      const end = addDays(days[6], 1).toISOString()
      return (await supabase.from('bookings')
        .select('*, services(name), barbers(display_name), profiles:client_id(full_name)')
        .gte('slot_start', start).lt('slot_start', end)
        .in('status', ['pending', 'confirmed', 'reschedule_requested'])).data as Booking[]
    },
  })

  const byDay = (d: Date) => (bookings ?? []).filter((b) =>
    format(new Date(b.slot_start), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd')
  ).sort((a, b) => a.slot_start.localeCompare(b.slot_start))

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-display">Calendar</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setWeekOffset((w) => w - 1)}>← Prev</Button>
          <span className="text-sm">{format(days[0], 'd MMM')} – {format(days[6], 'd MMM')}</span>
          <Button size="sm" variant="outline" onClick={() => setWeekOffset((w) => w + 1)}>Next →</Button>
          <Button size="sm" variant="ghost" onClick={() => setWeekOffset(0)}>Today</Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-xs">
        {days.map((d) => (
          <div key={d.toISOString()} className="min-h-[200px] rounded-lg border border-charcoal/10 p-2">
            <div className="font-medium mb-2">{format(d, 'EEE d')}</div>
            <div className="space-y-1">
              {byDay(d).map((b) => (
                <div key={b.id}
                  className={`rounded p-1.5 text-[10px] leading-tight ${
                    b.status === 'confirmed' ? 'bg-green-100 text-green-900' :
                    b.status === 'pending' ? 'bg-amber-100 text-amber-900' :
                    'bg-blue-100 text-blue-900'}`}>
                  <div className="font-medium">{format(new Date(b.slot_start), 'HH:mm')}</div>
                  <div>{(b as any).profiles?.full_name}</div>
                  <div className="opacity-70">{(b as any).services?.name}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}