-- ============================================================
-- 0004_jwt_hook.sql — Custom Access Token hook injects user_role
-- ============================================================
-- After running this migration, go to Supabase Dashboard →
-- Authentication → Hooks → Custom Access Token → enable → select
-- public.custom_access_token_hook.

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims    jsonb;
  user_role public.app_role;
begin
  select role into user_role
    from public.user_roles
   where user_id = (event->>'user_id')::uuid
   limit 1;

  claims := coalesce(event->'claims', '{}'::jsonb);
  claims := jsonb_set(claims, '{user_role}', to_jsonb(coalesce(user_role::text, 'client')));

  return jsonb_set(event, '{claims}', claims);
end $$;

grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;
grant all on table public.user_roles to supabase_auth_admin;