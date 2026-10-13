// POST /functions/v1/create-payfast-payment  { booking_id }
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import { corsHeaders } from '../_shared/cors.ts'
import { signPayfastData } from '../_shared/payfast.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const SUPABASE_URL         = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_ANON_KEY    = Deno.env.get('SUPABASE_ANON_KEY')!
    const SERVICE_ROLE_KEY     = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const PAYFAST_MERCHANT_ID  = Deno.env.get('PAYFAST_MERCHANT_ID')!
    const PAYFAST_MERCHANT_KEY = Deno.env.get('PAYFAST_MERCHANT_KEY')!
    const PAYFAST_PASSPHRASE   = Deno.env.get('PAYFAST_PASSPHRASE') ?? ''
    const PAYFAST_SANDBOX      = Deno.env.get('PAYFAST_SANDBOX') === 'true'
    const SITE_URL             = Deno.env.get('SITE_URL')!
    const ITN_URL              = `${SUPABASE_URL}/functions/v1/payfast-itn`

    // Verify the caller
    const authHeader = req.headers.get('Authorization') ?? ''
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return json({ error: 'Unauthorized' }, 401)

    const { booking_id } = await req.json()
    if (!booking_id) return json({ error: 'booking_id required' }, 400)

    // Load booking using service role (so we can read it regardless of RLS)
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    const { data: booking, error: bErr } = await admin
      .from('bookings')
      .select('*, services(name), profiles:client_id(full_name, phone)')
      .eq('id', booking_id)
      .single()

    if (bErr || !booking) return json({ error: 'Booking not found' }, 404)
    if (booking.client_id !== user.id) return json({ error: 'Forbidden' }, 403)
    if (booking.payment_status === 'paid') return json({ error: 'Already paid' }, 409)

    const [first, ...rest] = (booking.profiles?.full_name ?? user.email ?? 'Client').split(' ')
    const last = rest.join(' ') || 'Client'

    const fields: Record<string, string> = {
      merchant_id: PAYFAST_MERCHANT_ID,
      merchant_key: PAYFAST_MERCHANT_KEY,
      return_url: `${SITE_URL}/thank-you?booking_id=${booking.id}`,
      cancel_url: `${SITE_URL}/book?cancelled=1`,
      notify_url: ITN_URL,
      name_first: first,
      name_last: last,
      email_address: user.email ?? '',
      m_payment_id: booking.id,
      amount: Number(booking.amount_zar).toFixed(2),
      item_name: `BarberShop ZA — ${booking.services?.name ?? 'Appointment'}`,
    }

    fields.signature = await signPayfastData(fields, PAYFAST_PASSPHRASE)

    const payfast_url = PAYFAST_SANDBOX
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process'

    return json({ payfast_url, fields })
  } catch (e) {
    console.error(e)
    return json({ error: (e as Error).message }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}