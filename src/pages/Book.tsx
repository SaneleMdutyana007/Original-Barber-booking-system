import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { addDays, format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import SEO from '@/components/SEO'
import Breadcrumbs from '@/components/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import ResponsePromiseBanner from '@/components/ResponsePromiseBanner'
import { ZAR } from '@/lib/utils'
import type { Service, Barber, AvailabilitySlot } from '@/lib/types'

export default function Book() {
  const [params] = useSearchParams()
  const toast = useToast()
  const [step, setStep] = useState(1)
  const [serviceId, setServiceId] = useState(params.get('service') ?? '')
  const [barberId, setBarberId] = useState(params.get('barber') ?? '')
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [slot, setSlot] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Guard against the cancelled-payment toast firing twice under React 18
  // StrictMode (which runs effects twice in development).
  const cancelledShown = useRef(false)

  const { data: services } = useQuery({
    queryKey: ['book-services'],
    queryFn: async () =>
      (
        await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('sort_order')
      ).data as Service[],
  })

  const { data: barbers } = useQuery({
    queryKey: ['book-barbers'],
    queryFn: async () =>
      (await supabase.from('barbers').select('*').eq('is_active', true))
        .data as Barber[],
  })

  const selectedService = services?.find((s) => s.id === serviceId)
  const selectedBarber = barbers?.find((b) => b.id === barberId)
  const weekday = new Date(date).getDay()

  const { data: availability } = useQuery({
    queryKey: ['availability', barberId, weekday],
    enabled: !!barberId,
    queryFn: async () =>
      (
        await supabase
          .from('availability_slots')
          .select('*')
          .eq('barber_id', barberId)
          .eq('day_of_week', weekday)
      ).data as AvailabilitySlot[],
  })

  const { data: existingBookings } = useQuery({
    queryKey: ['bookings-on', barberId, date],
    enabled: !!barberId,
    queryFn: async () => {
      const start = new Date(`${date}T00:00:00`).toISOString()
      const end = new Date(`${date}T23:59:59`).toISOString()
      return (
        await supabase
          .from('bookings')
          .select('slot_start')
          .eq('barber_id', barberId)
          .gte('slot_start', start)
          .lte('slot_start', end)
          .in('status', ['pending', 'confirmed'])
      ).data as { slot_start: string }[]
    },
  })

  const slots = useMemo(() => {
    if (!availability || !selectedService) return []
    const taken = new Set(
      (existingBookings ?? []).map((b) => new Date(b.slot_start).getTime())
    )
    const out: string[] = []
    for (const a of availability) {
      const [sh, sm] = a.start_time.split(':').map(Number)
      const [eh, em] = a.end_time.split(':').map(Number)
      const start = new Date(
        `${date}T${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}:00`
      )
      const end = new Date(
        `${date}T${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}:00`
      )
      const step = 30
      for (
        let t = start;
        t.getTime() + selectedService.duration_minutes * 60000 <= end.getTime();
        t = new Date(t.getTime() + step * 60000)
      ) {
        if (t.getTime() > Date.now() && !taken.has(t.getTime())) {
          out.push(t.toISOString())
        }
      }
    }
    return out
  }, [availability, existingBookings, date, selectedService])

  useEffect(() => {
    if (cancelledShown.current) return
    if (params.get('cancelled')) {
      toast.push(
        'Payment was cancelled. Your booking is still on hold.',
        'error'
      )
    }
    cancelledShown.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = async () => {
    if (!serviceId || !barberId || !slot) return
    setSubmitting(true)
    try {
      const { data: bookingId, error: rpcErr } = await supabase.rpc('book_slot', {
        p_barber_id: barberId,
        p_service_id: serviceId,
        p_slot_start: slot,
      })
      if (rpcErr) throw rpcErr

      const {
        data: { session },
      } = await supabase.auth.getSession()

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payfast-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ booking_id: bookingId }),
        }
      )

      if (!res.ok) {
        const errBody = await res
          .json()
          .catch(() => ({ error: 'Payment init failed' }))
        throw new Error(errBody.error ?? 'Payment init failed')
      }

      const { payfast_url, fields } = await res.json()

      // Auto-submit hidden form to PayFast
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = payfast_url
      for (const [k, v] of Object.entries(fields)) {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = k
        input.value = String(v)
        form.appendChild(input)
      }
      document.body.appendChild(form)
      form.submit()
    } catch (e) {
      toast.push((e as Error).message, 'error')
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-content px-4 py-10">
      <SEO
        title="Book Your Appointment | BarberShop ZA"
        description="Choose your service, barber, and slot. Pay securely with PayFast. Booking confirmed in seconds."
        canonicalPath="/book"
      />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Book' }]} />
      <h1 className="text-4xl font-display mb-2">Book your visit</h1>
      <div className="mb-6 max-w-2xl">
        <ResponsePromiseBanner />
      </div>

      <ol className="mb-6 flex flex-wrap gap-3 text-xs">
        {['Service', 'Barber', 'Slot', 'Confirm'].map((label, i) => (
          <li
            key={label}
            className={`rounded-full px-3 py-1 ${
              step === i + 1 ? 'bg-amber-500 text-white' : 'bg-charcoal/5'
            }`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {step === 1 && (
        <div className="grid gap-4 md:grid-cols-3">
          {(services ?? []).map((s) => (
            <Card
              key={s.id}
              onClick={() => {
                setServiceId(s.id)
                setStep(2)
              }}
              className={`cursor-pointer p-4 ${
                serviceId === s.id ? 'border-amber-500' : ''
              }`}
            >
              <div className="font-medium">{s.name}</div>
              <div className="mt-1 text-sm text-charcoal/60">
                {s.duration_minutes} min
              </div>
              <div className="mt-2 font-medium">{ZAR(s.price_zar)}</div>
            </Card>
          ))}
        </div>
      )}

      {step === 2 && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {(barbers ?? []).map((b) => (
              <Card
                key={b.id}
                onClick={() => {
                  setBarberId(b.id)
                  setStep(3)
                }}
                className={`cursor-pointer p-4 ${
                  barberId === b.id ? 'border-amber-500' : ''
                }`}
              >
                <div className="font-medium">{b.display_name}</div>
                <div className="mt-1 text-xs text-charcoal/60">
                  {b.specialties.join(' • ')}
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <label className="block text-sm mb-2">
            Date
            <input
              type="date"
              value={date}
              min={format(new Date(), 'yyyy-MM-dd')}
              max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
              onChange={(e) => setDate(e.target.value)}
              className="ml-3 rounded-lg border border-charcoal/20 px-3 py-2"
            />
          </label>
          <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-6">
            {slots.length === 0 && (
              <p className="col-span-full text-sm text-charcoal/60">
                No slots available on this day.
              </p>
            )}
            {slots.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSlot(s)
                  setStep(4)
                }}
                className={`rounded-lg border p-2 text-sm ${
                  slot === s
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-charcoal/15 hover:border-amber-500'
                }`}
              >
                {new Date(s).toLocaleTimeString('en-ZA', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
          </div>
        </>
      )}

      {step === 4 && (
        <Card className="max-w-lg p-6">
          <h2 className="text-2xl font-display mb-4">Confirm your booking</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Service</dt>
              <dd>{selectedService?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Barber</dt>
              <dd>{selectedBarber?.display_name}</dd>
            </div>
            <div className="flex justify-between">
              <dt>When</dt>
              <dd>{new Date(slot).toLocaleString('en-ZA')}</dd>
            </div>
            <div className="flex justify-between font-medium">
              <dt>Total</dt>
              <dd>{ZAR(selectedService?.price_zar ?? 0)}</dd>
            </div>
          </dl>
          <div className="mt-5 flex gap-3">
            <Button onClick={submit} disabled={submitting}>
              {submitting ? 'Redirecting to PayFast…' : 'Pay & Confirm'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setStep(3)}
              disabled={submitting}
            >
              Back
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}