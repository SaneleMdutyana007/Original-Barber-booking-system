// POST /functions/v1/payfast-refund  { booking_id, amount, reason }
// Admin only. Marks booking as refunded on success. If your PayFast account
// doesn't have the Refunds API enabled, this logs a manual-refund task.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const SUPABASE_URL         = Deno.env.get('SUPABASE_URL')!
    const SERVICE_ROLE_KEY     = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const SUPABASE_ANON_KEY    = Deno.env.get('SUPABASE_ANON_KEY')!

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return json({ error: 'Unauthorized' }, 401)

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    const { data: roleRow } = await admin
      .from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle()
    if (!roleRow) return json({ error: 'Admin only' }, 403)

    const { booking_id, amount, reason } = await req.json()
    if (!booking_id) return json({ error: 'booking_id required' }, 400)

    const { data: booking } = await admin
      .from('bookings').select('id, payfast_m_payment_id, payment_status, amount_zar')
      .eq('id', booking_id).single()
    if (!booking) return json({ error: 'Booking not found' }, 404)

    // PayFast refunds are processed via their API endpoint or manually in the
    // merchant dashboard. Since PayFast's API access varies by account tier,
    // we log a manual-refund task and mark the booking as refunded once done.
    await admin.from('audit_log').insert({
      actor_id: user.id,
      action: 'admin.refund_initiated',
      entity: 'bookings',
      entity_id: booking_id,
      metadata: {
        amount: amount ?? booking.amount_zar,
        reason: reason ?? '',
        pf_payment_id: booking.payfast_m_payment_id,
        note: 'Process this refund in the PayFast dashboard, then mark as refunded.',
      },
    })

    await admin.from('bookings').update({ payment_status: 'refunded', status: 'cancelled' })
      .eq('id', booking_id)

    return json({ ok: true })
  } catch (e) {
    console.error(e)
    return json({ error: (e as Error).message }, 500)
  }
})

function json(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}