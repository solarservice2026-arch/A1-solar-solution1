create or replace function public.current_auth_context()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'roles',
    coalesce((
      select jsonb_agg(distinct r.name)
      from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid()
    ), '[]'::jsonb),
    'permissions',
    coalesce((
      select jsonb_agg(distinct p.key)
      from public.user_roles ur
      join public.role_permissions rp on rp.role_id = ur.role_id
      join public.permissions p on p.id = rp.permission_id
      where ur.user_id = auth.uid()
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.current_auth_context() from public;
grant execute on function public.current_auth_context() to authenticated;
