update public.profiles p
set active = true,
    updated_at = now()
from auth.users u
where p.id = u.id
  and u.raw_user_meta_data ->> 'e2e_test_user' = 'true'
  and exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = p.id
      and r.name = 'manager'
  );
