-- ============================================================
-- 0005_storage.sql — buckets + RLS on storage.objects
-- ============================================================
insert into storage.buckets (id, name, public) values
  ('service-images',    'service-images',    true),
  ('barber-photos',     'barber-photos',     true),
  ('case-study-images', 'case-study-images', true)
on conflict (id) do nothing;

-- Public can read
create policy "storage_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('service-images', 'barber-photos', 'case-study-images'));

-- Only admins can write
create policy "storage_admin_write" on storage.objects
  for all to authenticated
  using (
    bucket_id in ('service-images', 'barber-photos', 'case-study-images')
    and exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin')
  )
  with check (
    bucket_id in ('service-images', 'barber-photos', 'case-study-images')
    and exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin')
  );