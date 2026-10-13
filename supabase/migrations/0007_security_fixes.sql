-- Fix 1: Remove the direct-insert policy on bookings.
-- All inserts must go through public.book_slot(), which is SECURITY DEFINER
-- and validates price against services.price_zar.
drop policy if exists "bookings_insert_own_pending" on public.bookings;

-- Fix 2: Reject bookings in the past or more than 90 days ahead.
create or replace function public.book_slot(
  p_barber_id  uuid,
  p_service_id uuid,
  p_slot_start timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id  uuid := auth.uid();
  v_duration   int;
  v_price      numeric(10,2);
  v_conflict   int;
  v_booking_id uuid;
begin
  if v_client_id is null then raise exception 'Not authenticated'; end if;

  if p_slot_start <= now() then
    raise exception 'Slot must be in the future';
  end if;

  if p_slot_start > now() + interval '90 days' then
    raise exception 'Slot is too far in the future';
  end if;

  select duration_minutes, price_zar into v_duration, v_price
    from public.services where id = p_service_id and is_active = true;
  if v_duration is null then raise exception 'Service not available'; end if;

  select count(*) into v_conflict
    from public.bookings
   where barber_id = p_barber_id
     and slot_start = p_slot_start
     and status in ('pending', 'confirmed')
   for update;

  if v_conflict > 0 then raise exception 'Slot no longer available'; end if;

  insert into public.bookings
    (client_id, barber_id, service_id, slot_start, slot_end, amount_zar)
  values
    (v_client_id, p_barber_id, p_service_id, p_slot_start,
     p_slot_start + make_interval(mins => v_duration), v_price)
  returning id into v_booking_id;

  insert into public.audit_log (actor_id, action, entity, entity_id, metadata)
  values (v_client_id, 'booking.create', 'bookings', v_booking_id::text,
          jsonb_build_object('barber_id', p_barber_id, 'slot_start', p_slot_start));

  return v_booking_id;
end $$;