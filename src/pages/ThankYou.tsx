import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import SEO from '@/components/SEO'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ZAR, formatSlot } from '@/lib/utils'
import { downloadICS } from '@/lib/ics'
import { SITE } from '@/lib/constants'
import type { Booking } from '@/lib/types'

export default function ThankYou() {
  const [params] = useSearchParams()
  const id = params.get('booking_id')
  const [polling, setPolling] = useState(true)

  const { data: booking, refetch } = useQuery({
    queryKey: ['booking', id],
    enabled: !!id,
    refetchInterval: polling ? 3000 : false,
    queryFn: async () => (await supabase.from('bookings')
      .select('*, services(name), barbers(display_name)')
      .eq('id', id!).maybeSingle()).data as Booking | null,
  })

  useEffect(() => {
    if (!booking) return
    if (booking.payment_status === 'paid' || Date.now() - (window as any).__ty > 60000) {
      setPolling(false)
    }
    if (!(window as any).__ty) (window as any).__ty = Date.now()
  }, [booking])

  return (
    <div className="mx-auto max-w-content px-4 py-16">
      <SEO title="Booking Confirmed | BarberShop ZA"
           description="Your booking is confirmed." canonicalPath="/thank-you" noindex />

      <Card className="mx-auto max-w-xl p-8">
        <h1 className="text-4xl font-display mb-2">You're booked.</h1>
        <p className="text-charcoal/70">Reference: <code className="text-xs">{id?.slice(0,8)}</code></p>

        {!booking && <p className="mt-6 text-sm">Loading booking…</p>}

        {booking && (
          <>
            <dl className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between"><dt>Service</dt><dd>{(booking as any).services?.name}</dd></div>
              <div className="flex justify-between"><dt>Barber</dt><dd>{(booking as any).barbers?.display_name}</dd></div>
              <div className="flex justify-between"><dt>When</dt><dd>{formatSlot(booking.slot_start)}</dd></div>
              <div className="flex justify-between"><dt>Amount</dt><dd>{ZAR(booking.amount_zar)}</dd></div>
              <div className="flex justify-between"><dt>Payment</dt>
                <dd className={booking.payment_status === 'paid' ? 'text-green-700' : 'text-amber-600'}>
                  {booking.payment_status === 'paid' ? 'Paid' : 'Confirming…'}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => downloadICS({
                title: `BarberShop ZA — ${(booking as any).services?.name}`,
                description: `Booking ref ${booking.id}`,
                location: `${SITE.address.street}, ${SITE.address.locality}`,
                startISO: booking.slot_start, endISO: booking.slot_end,
                filename: `barbershop-${booking.id.slice(0,8)}.ics`,
              })}>Add to Calendar</Button>
              <Button variant="outline" onClick={() => { navigator.clipboard.writeText(booking.id); }}>Copy Reference</Button>
              <Link to="/dashboard"><Button variant="ghost">Go to Dashboard →</Button></Link>
            </div>

            {booking.payment_status === 'paid' && (
              <p className="mt-6 text-sm text-charcoal/70">
                Save this page. A confirmation email is on its way. Manage your booking anytime from the dashboard.
              </p>
            )}
            {booking.payment_status !== 'paid' && polling && (
              <p className="mt-6 text-sm text-charcoal/60">
                Waiting for PayFast to confirm your payment… This usually takes a few seconds.
                <button onClick={() => refetch()} className="ml-2 underline">Refresh now</button>
              </p>
            )}
          </>
        )}
      </Card>
    </div>
  )
}