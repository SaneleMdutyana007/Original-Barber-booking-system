-- ============================================================
-- 0003_functions.sql — booking RPCs (SECURITY DEFINER)
-- ============================================================

-- Lock + insert. Raises if the slot was taken between UI load and submit.
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

  select duration_minutes, price_zar into v_duration, v_price
    from public.services where id = p_service_id and is_active = true;
  if v_duration is null then raise exception 'Service not available'; end if;

  -- Row lock across any active booking on that barber+slot.
  select count(*) into v_conflict
    from public.bookings
   where barber_id = p_barber_id
     and slot_start = p_slot_start
     and status in ('pending', 'confirmed')
   for update;

  if v_conflict > 0 then
    raise exception 'Slot no longer available';
  end if;

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

-- Client requests cancellation (does NOT change booking status directly).
create or replace function public.request_booking_cancellation(
  p_booking_id uuid,
  p_reason     text
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare v_req uuid; v_owner uuid;
begin
  select client_id into v_owner from public.bookings where id = p_booking_id;
  if v_owner is null or v_owner <> auth.uid() then raise exception 'Not allowed'; end if;

  insert into public.booking_requests (booking_id, requested_by, request_type, reason)
  values (p_booking_id, auth.uid(), 'cancel', p_reason)
  returning id into v_req;

  update public.bookings set status = 'reschedule_requested' where id = p_booking_id;

  insert into public.audit_log (actor_id, action, entity, entity_id, metadata)
  values (auth.uid(), 'booking.request_cancel', 'bookings', p_booking_id::text, jsonb_build_object('reason', p_reason));

  return v_req;
end $$;

-- Client requests reschedule (does NOT change slot).
create or replace function public.request_booking_reschedule(
  p_booking_id      uuid,
  p_new_slot_start  timestamptz,
  p_reason          text
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare v_req uuid; v_owner uuid;
begin
  select client_id into v_owner from public.bookings where id = p_booking_id;
  if v_owner is null or v_owner <> auth.uid() then raise exception 'Not allowed'; end if;
  if p_new_slot_start <= now() then raise exception 'New slot must be in the future'; end if;

  insert into public.booking_requests (booking_id, requested_by, request_type, requested_slot_start, reason)
  values (p_booking_id, auth.uid(), 'reschedule', p_new_slot_start, p_reason)
  returning id into v_req;

  update public.bookings set status = 'reschedule_requested' where id = p_booking_id;

  insert into public.audit_log (actor_id, action, entity, entity_id, metadata)
  values (auth.uid(), 'booking.request_reschedule', 'bookings', p_booking_id::text,
          jsonb_build_object('new_slot', p_new_slot_start));

  return v_req;
end $$;

-- Admin-only status flip.
create or replace function public.admin_set_booking_status(
  p_booking_id uuid,
  p_new_status public.booking_status
)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;

  update public.bookings set status = p_new_status where id = p_booking_id;

  insert into public.audit_log (actor_id, action, entity, entity_id, metadata)
  values (auth.uid(), 'admin.set_status', 'bookings', p_booking_id::text,
          jsonb_build_object('status', p_new_status));
end $$;

-- Admin approves/rejects a reschedule request. On approval, moves the slot with locking.
create or replace function public.approve_reschedule_request(
  p_request_id uuid,
  p_approve    boolean
)
returns void
language plpgsql security definer set search_path = public as $$
declare r record; v_duration int; v_conflict int;
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;

  select * into r from public.booking_requests where id = p_request_id for update;
  if r is null then raise exception 'Request not found'; end if;
  if r.status <> 'pending' then raise exception 'Request already resolved'; end if;

  if p_approve and r.request_type = 'reschedule' then
    select duration_minutes into v_duration from public.services s
      join public.bookings b on b.service_id = s.id where b.id = r.booking_id;

    select count(*) into v_conflict from public.bookings
     where barber_id = (select barber_id from public.bookings where id = r.booking_id)
       and slot_start = r.requested_slot_start
       and status in ('pending', 'confirmed')
       and id <> r.booking_id
     for update;

    if v_conflict > 0 then raise exception 'Requested slot already taken'; end if;

    update public.bookings
       set slot_start = r.requested_slot_start,
           slot_end   = r.requested_slot_start + make_interval(mins => v_duration),
           status     = 'confirmed'
     where id = r.booking_id;
  else
    update public.bookings set status = 'confirmed' where id = r.booking_id;
  end if;

  update public.booking_requests
     set status = case when p_approve then 'approved'::public.request_status else 'rejected'::public.request_status end,
         resolved_at = now(),
         resolved_by = auth.uid()
   where id = p_request_id;

  insert into public.audit_log (actor_id, action, entity, entity_id, metadata)
  values (auth.uid(),
          case when p_approve then 'admin.approve_request' else 'admin.reject_request' end,
          'booking_requests', p_request_id::text, '{}'::jsonb);
end $$;

revoke all on function public.book_slot(uuid, uuid, timestamptz) from public;
grant execute on function public.book_slot(uuid, uuid, timestamptz) to authenticated;

revoke all on function public.request_booking_cancellation(uuid, text) from public;
grant execute on function public.request_booking_cancellation(uuid, text) to authenticated;

revoke all on function public.request_booking_reschedule(uuid, timestamptz, text) from public;
grant execute on function public.request_booking_reschedule(uuid, timestamptz, text) to authenticated;

revoke all on function public.admin_set_booking_status(uuid, public.booking_status) from public;
grant execute on function public.admin_set_booking_status(uuid, public.booking_status) to authenticated;

revoke all on function public.approve_reschedule_request(uuid, boolean) from public;
grant execute on function public.approve_reschedule_request(uuid, boolean) to authenticated;