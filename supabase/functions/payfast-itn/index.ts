// POST /functions/v1/payfast-itn — PayFast webhook. Never exposes secrets to clients.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import { signPayfastData, verifyPayfastSource } from '../_shared/payfast.ts'

Deno.serve(async (req) => {
  try {
    const SERVICE_ROLE_KEY     = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const SUPABASE_URL         = Deno.env.get('SUPABASE_URL')!
    const PAYFAST_PASSPHRASE   = Deno.env.get('PAYFAST_PASSPHRASE') ?? ''
    const PAYFAST_SANDBOX      = Deno.env.get('PAYFAST_SANDBOX') === 'true'

    const raw = await req.text()
    const params = new URLSearchParams(raw)
    const data: Record<string, string> = {}
    params.forEach((v, k) => (data[k] = v))

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    const log = async (action: string, entity_id: string | null, metadata: unknown) => {
      await admin.from('audit_log').insert({
        action, entity: 'payfast_itn', entity_id, metadata,
      })
    }

    // 1) Signature check
    const posted = data.signature
    delete data.signature
    const expected = await signPayfastData(data, PAYFAST_PASSPHRASE)
    if (posted !== expected) {
      await log('itn.bad_signature', data.m_payment_id ?? null, { posted, expected })
      return new Response('Invalid signature', { status: 400 })
    }

    // 2) Source IP check (live only)
    if (!PAYFAST_SANDBOX) {
      const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
        req.headers.get('cf-connecting-ip') ?? ''
      const ok = await verifyPayfastSource(ip)
      if (!ok) {
        await log('itn.bad_source_ip', data.m_payment_id ?? null, { ip })
        return new Response('Invalid source', { status: 400 })
      }
    }

    // 3) Post-back validation
    const validateUrl = PAYFAST_SANDBOX
      ? 'https://sandbox.payfast.co.za/eng/query/validate'
      : 'https://www.payfast.co.za/eng/query/validate'

    const back = await fetch(validateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: raw,
    })
    const text = (await back.text()).trim()
    if (text !== 'VALID') {
      await log('itn.postback_invalid', data.m_payment_id ?? null, { text })
      return new Response('Invalid postback', { status: 400 })
    }

    // 4) Amount + booking match
    const { data: booking } = await admin
      .from('bookings').select('id, amount_zar, payment_status')
      .eq('id', data.m_payment_id).maybeSingle()

    if (!booking) {
      await log('itn.booking_not_found', data.m_payment_id, {})
      return new Response('Booking not found', { status: 404 })
    }
    if (Number(data.amount_gross) + 0.01 < Number(booking.amount_zar)) {
      await log('itn.amount_mismatch', booking.id, { posted: data.amount_gross, expected: booking.amount_zar })
      return new Response('Amount mismatch', { status: 400 })
    }

    // Idempotent update
    if (booking.payment_status === 'paid') {
      return new Response('OK', { status: 200 })
    }

    await admin.from('bookings').update({
      payment_status: 'paid',
      status: 'confirmed',
      payfast_m_payment_id: data.pf_payment_id,
    }).eq('id', booking.id)

    await log('itn.paid', booking.id, { pf_payment_id: data.pf_payment_id, amount: data.amount_gross })
    return new Response('OK', { status: 200 })
  } catch (e) {
    console.error(e)
    return new Response('Server error', { status: 500 })
  }
})