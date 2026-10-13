-- ============================================================
-- 0002_rls.sql — enable RLS everywhere and write policies
-- ============================================================

alter table public.user_roles         enable row level security;
alter table public.profiles           enable row level security;
alter table public.services           enable row level security;
alter table public.barbers            enable row level security;
alter table public.availability_slots enable row level security;
alter table public.bookings           enable row level security;
alter table public.booking_requests   enable row level security;
alter table public.reviews            enable row level security;
alter table public.case_studies       enable row level security;
alter table public.faqs               enable row level security;
alter table public.page_meta          enable row level security;
alter table public.audit_log          enable row level security;

-- Helper functions (stable, security definer so they bypass RLS internally)
create or replace function public.current_role()
returns public.app_role language sql stable security definer set search_path = public as $$
  select role from public.user_roles where user_id = auth.uid() limit 1;
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.user_roles where user_id = auth.uid() limit 1), false);
$$;

-- ---------- user_roles ----------
create policy "user_roles_select_self" on public.user_roles
  for select to authenticated using (user_id = (select auth.uid()));

create policy "user_roles_admin_all" on public.user_roles
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------- profiles ----------
create policy "profiles_select_self" on public.profiles
  for select to authenticated using (id = (select auth.uid()));

create policy "profiles_select_admin" on public.profiles
  for select to authenticated using ((select public.is_admin()));

create policy "profiles_update_self" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "profiles_admin_all" on public.profiles
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------- services ----------
create policy "services_public_read" on public.services
  for select to anon, authenticated using (is_active = true);

create policy "services_admin_all" on public.services
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------- barbers ----------
create policy "barbers_public_read" on public.barbers
  for select to anon, authenticated using (is_active = true);

create policy "barbers_admin_all" on public.barbers
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------- availability_slots ----------
create policy "availability_public_read" on public.availability_slots
  for select to anon, authenticated using (true);

create policy "availability_admin_all" on public.availability_slots
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------- bookings ----------
-- Clients read own
create policy "bookings_select_own" on public.bookings
  for select to authenticated
  using (client_id = (select auth.uid()));

-- Admins read all
create policy "bookings_select_admin" on public.bookings
  for select to authenticated using ((select public.is_admin()));

-- Clients create their own pending/unpaid rows only
create policy "bookings_insert_own_pending" on public.bookings
  for insert to authenticated
  with check (
    client_id = (select auth.uid())
    and status = 'pending'
    and payment_status = 'unpaid'
  );

-- NO client UPDATE policy — status changes go through SECURITY DEFINER functions.
-- Admins can update any row.
create policy "bookings_admin_update" on public.bookings
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "bookings_admin_delete" on public.bookings
  for delete to authenticated using ((select public.is_admin()));

-- ---------- booking_requests ----------
create policy "requests_select_own" on public.booking_requests
  for select to authenticated
  using (
    requested_by = (select auth.uid())
    or exists (select 1 from public.bookings b where b.id = booking_id and b.client_id = (select auth.uid()))
  );

create policy "requests_select_admin" on public.booking_requests
  for select to authenticated using ((select public.is_admin()));

create policy "requests_admin_all" on public.booking_requests
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------- reviews ----------
create policy "reviews_public_published" on public.reviews
  for select to anon, authenticated using (is_published = true);

create policy "reviews_client_read_own" on public.reviews
  for select to authenticated using (client_id = (select auth.uid()));

-- Clients can insert a review ONLY for their own completed, paid booking.
create policy "reviews_client_insert_own_completed" on public.reviews
  for insert to authenticated
  with check (
    client_id = (select auth.uid())
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and b.client_id = (select auth.uid())
        and b.payment_status = 'paid'
        and b.status = 'confirmed'
        and b.slot_end < now()
    )
  );

create policy "reviews_admin_all" on public.reviews
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------- case_studies ----------
create policy "case_studies_public_read" on public.case_studies
  for select to anon, authenticated using (published = true);

create policy "case_studies_admin_all" on public.case_studies
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------- faqs ----------
create policy "faqs_public_read" on public.faqs
  for select to anon, authenticated using (true);

create policy "faqs_admin_all" on public.faqs
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------- page_meta ----------
create policy "page_meta_public_read" on public.page_meta
  for select to anon, authenticated using (true);

create policy "page_meta_admin_all" on public.page_meta
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------- audit_log ----------
create policy "audit_admin_read" on public.audit_log
  for select to authenticated using ((select public.is_admin()));

create policy "audit_insert_any_authenticated" on public.audit_log
  for insert to authenticated with check (actor_id = (select auth.uid()));